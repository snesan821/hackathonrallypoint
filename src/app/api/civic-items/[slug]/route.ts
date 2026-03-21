import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/server'
import { errorResponse, successResponse } from '@/lib/api/middleware'

/**
 * GET /api/civic-items/[slug]
 * Get full civic item details by slug
 *
 * Records a VIEW engagement event for authenticated users (idempotent per session)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return errorResponse('Slug parameter is required', 400)
    }

    // Fetch civic item with all related data
    const civicItem = await prisma.civicItem.findUnique({
      where: { slug },
      include: {
        aiSummary: true,
        sourceDocuments: {
          select: {
            id: true,
            sourceUrl: true,
            uploadedAt: true,
          },
        },
        organizerUpdates: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            comments: true,
            engagements: true,
          },
        },
      },
    })

    if (!civicItem) {
      return errorResponse('Civic item not found', 404)
    }

    // Get current user
    const user = await getCurrentUser()

    // Record VIEW engagement event (idempotent - only create if doesn't exist)
    if (user) {
      try {
        // Check if user has already viewed this item in this session
        // For MVP, we consider "session" as last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const existingView = await prisma.engagementEvent.findFirst({
          where: {
            userId: user.id,
            civicItemId: civicItem.id,
            action: 'VIEW',
            timestamp: { gte: twentyFourHoursAgo },
          },
        })

        if (!existingView) {
          await prisma.engagementEvent.create({
            data: {
              userId: user.id,
              civicItemId: civicItem.id,
              action: 'VIEW',
              metadata: {
                userAgent: req.headers.get('user-agent'),
                referrer: req.headers.get('referer'),
              },
            },
          })
          console.log(`✅ VIEW engagement created for user ${user.id} on item ${civicItem.id}`)
        } else {
          console.log(`ℹ️ VIEW engagement already exists for user ${user.id} on item ${civicItem.id}`)
        }
      } catch (error) {
        // Don't fail the request if engagement tracking fails
        console.error('Failed to record VIEW engagement:', error)
      }
    }

    // Get user's engagement state for this item
    let userEngagement: any = null
    if (user) {
      const engagements = await prisma.engagementEvent.findMany({
        where: {
          userId: user.id,
          civicItemId: civicItem.id,
        },
        select: {
          action: true,
          timestamp: true,
        },
      })

      userEngagement = {
        actions: engagements.map((e) => e.action),
        hasSupported: engagements.some((e) => e.action === 'SUPPORT'),
        hasSaved: engagements.some((e) => e.action === 'SAVE'),
        hasCommented: engagements.some((e) => e.action === 'COMMENT'),
        lastEngagement: engagements.length > 0
          ? Math.max(...engagements.map((e) => e.timestamp.getTime()))
          : null,
      }
    }

    // Transform to detail format
    const detail = {
      id: civicItem.id,
      title: civicItem.title,
      slug: civicItem.slug,
      categories: civicItem.categories,
      type: civicItem.type,
      status: civicItem.status,
      jurisdictionTags: civicItem.jurisdictionTags,
      jurisdictionLevel: civicItem.jurisdictionLevel,
      summary: civicItem.summary,
      fullDescription: civicItem.fullDescription,
      deadline: civicItem.deadline,
      currentSupport: civicItem.currentSupport,
      targetSupport: civicItem.targetSupport,
      allowsOnlineSignature: civicItem.allowsOnlineSignature,
      tags: civicItem.tags,
      districtIds: civicItem.districtIds,
      latitude: civicItem.latitude,
      longitude: civicItem.longitude,
      officialActionUrl: civicItem.officialActionUrl,
      isVerified: civicItem.isVerified,

      // Related data
      aiSummary: civicItem.aiSummary ? {
        plainSummary: civicItem.aiSummary.plainSummary,
        whoAffected: civicItem.aiSummary.whoAffected,
        whatChanges: civicItem.aiSummary.whatChanges,
        whyItMatters: civicItem.aiSummary.whyItMatters,
        argumentsFor: civicItem.aiSummary.argumentsFor,
        argumentsAgainst: civicItem.aiSummary.argumentsAgainst,
        importantDates: civicItem.aiSummary.importantDates,
        nextActions: civicItem.aiSummary.nextActions,
        categories: civicItem.aiSummary.categories,
        affectedJurisdictions: civicItem.aiSummary.affectedJurisdictions,
        generatedAt: civicItem.aiSummary.generatedAt,
      } : null,

      sourceUrl: civicItem.sourceUrl || civicItem.sourceDocuments[0]?.sourceUrl || null,

      organizerUpdates: civicItem.organizerUpdates.map((update) => ({
        id: update.id,
        title: update.title,
        body: update.body,
        isVerified: update.isVerified,
        createdAt: update.createdAt,
        author: update.author,
      })),

      // Counts
      commentCount: civicItem._count.comments,
      engagementCount: civicItem._count.engagements,

      // User state
      userEngagement,

      // Timestamps
      createdAt: civicItem.createdAt,
      updatedAt: civicItem.updatedAt,
    }

    return successResponse(detail)
  } catch (error: any) {
    console.error('GET /api/civic-items/[slug] error:', error)
    return errorResponse('Failed to fetch civic item details')
  }
}
