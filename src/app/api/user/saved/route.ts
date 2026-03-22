import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/server'
import { getSearchParams, buildPaginatedResponse, errorResponse } from '@/lib/api/middleware'

/**
 * GET /api/user/saved
 * Get user's saved civic items
 *
 * Query params:
 * - page: Page number
 * - pageSize: Items per page
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const searchParams = getSearchParams(req)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    const saveWhere = {
      userId: user.id,
      action: 'SAVE' as const,
    }

    const [totalCount, savedEngagements] = await Promise.all([
      prisma.engagementEvent.count({ where: saveWhere }),
      prisma.engagementEvent.findMany({
        where: saveWhere,
        select: {
          civicItemId: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    const paginatedIds = savedEngagements.map((engagement) => engagement.civicItemId)

    // Fetch civic items with user engagement data
    const items = await prisma.civicItem.findMany({
      where: {
        id: { in: paginatedIds },
      },
      include: {
        _count: {
          select: {
            comments: true,
            engagements: true,
          },
        },
      },
    })

    // Get all user engagements for these items
    const userEngagements = await prisma.engagementEvent.findMany({
      where: {
        userId: user.id,
        civicItemId: { in: paginatedIds },
      },
      select: {
        civicItemId: true,
        action: true,
      },
    })

    // Group engagements by civic item
    const engagementsByItem = new Map<string, string[]>()
    for (const engagement of userEngagements) {
      if (!engagementsByItem.has(engagement.civicItemId)) {
        engagementsByItem.set(engagement.civicItemId, [])
      }
      engagementsByItem.get(engagement.civicItemId)!.push(engagement.action)
    }

    // Sort items by save timestamp
    const savedTimestampMap = new Map(
      savedEngagements.map((e) => [e.civicItemId, e.timestamp])
    )

    items.sort((a, b) => {
      const aTime = savedTimestampMap.get(a.id)?.getTime() || 0
      const bTime = savedTimestampMap.get(b.id)?.getTime() || 0
      return bTime - aTime
    })

    // Transform to card format
    const cardData = items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      categories: item.categories,
      type: item.type,
      status: item.status,
      jurisdictionTags: item.jurisdictionTags,
      jurisdictionLevel: item.jurisdictionLevel,
      summary: item.summary,
      deadline: item.deadline,
      currentSupport: item.currentSupport,
      targetSupport: item.targetSupport,
      allowsOnlineSignature: item.allowsOnlineSignature,
      tags: item.tags,
      districtIds: item.districtIds,
      latitude: item.latitude,
      longitude: item.longitude,
      commentCount: item._count.comments,
      engagementCount: item._count.engagements,
      userActions: engagementsByItem.get(item.id) || [],
      savedAt: savedTimestampMap.get(item.id),
    }))

    const response = buildPaginatedResponse(cardData, { page, pageSize, totalCount })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GET /api/user/saved error:', error)
    return errorResponse('Failed to fetch saved items')
  }
}
