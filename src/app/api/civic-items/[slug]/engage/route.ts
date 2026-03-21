import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { withAuth, withValidation, withRateLimit, compose, errorResponse, successResponse } from '@/lib/api/middleware'
import { z } from 'zod'
import { EngagementAction } from '@prisma/client'

/**
 * Validation schema for engagement request
 */
const engageSchema = z.object({
  action: z.nativeEnum(EngagementAction),
  metadata: z.record(z.any()).optional(),
})

/**
 * POST /api/civic-items/[slug]/engage
 * Record user engagement action on a civic item
 *
 * Requires authentication
 * Rate limited to 30 actions per minute
 */
const handler = async (
  req: Request,
  { params, user, body }: any
) => {
  try {
    const { slug } = params
    const { action, metadata } = body

    // Find civic item by slug
    const civicItem = await prisma.civicItem.findUnique({
      where: { slug },
      select: { id: true, currentSupport: true, allowsOnlineSignature: true },
    })

    if (!civicItem) {
      return errorResponse('Civic item not found', 404)
    }

    // Validate action type constraints
    if (action === 'SIGN' && !civicItem.allowsOnlineSignature) {
      return errorResponse('This item does not allow online signatures', 400)
    }

    // Check for UNSUPPORT action
    if (action === 'UNSUPPORT') {
      // Find and delete the SUPPORT engagement
      const supportEngagement = await prisma.engagementEvent.findFirst({
        where: {
          userId: user.id,
          civicItemId: civicItem.id,
          action: 'SUPPORT',
        },
      })

      if (!supportEngagement) {
        return errorResponse('No support engagement found to remove', 404)
      }

      // Delete engagement and decrement support count atomically
      await prisma.$transaction([
        prisma.engagementEvent.delete({
          where: { id: supportEngagement.id },
        }),
        prisma.civicItem.update({
          where: { id: civicItem.id },
          data: { currentSupport: { decrement: 1 } },
        }),
      ])

      // Get updated engagement state
      const remainingEngagements = await prisma.engagementEvent.findMany({
        where: {
          userId: user.id,
          civicItemId: civicItem.id,
        },
        select: { action: true },
      })

      return successResponse({
        message: 'Support removed',
        userEngagement: {
          actions: remainingEngagements.map((e) => e.action),
          hasSupported: false,
          hasSaved: remainingEngagements.some((e) => e.action === 'SAVE'),
        },
        currentSupport: civicItem.currentSupport - 1,
      })
    }

    // Check for idempotency (can't perform same action twice)
    const existingEngagement = await prisma.engagementEvent.findFirst({
      where: {
        userId: user.id,
        civicItemId: civicItem.id,
        action,
      },
    })

    if (existingEngagement) {
      // For toggle actions like SAVE, treat as remove
      if (action === 'SAVE') {
        await prisma.engagementEvent.delete({
          where: { id: existingEngagement.id },
        })

        const remainingEngagements = await prisma.engagementEvent.findMany({
          where: {
            userId: user.id,
            civicItemId: civicItem.id,
          },
          select: { action: true },
        })

        return successResponse({
          message: 'Item unsaved',
          userEngagement: {
            actions: remainingEngagements.map((e) => e.action),
            hasSupported: remainingEngagements.some((e) => e.action === 'SUPPORT'),
            hasSaved: false,
          },
        })
      }

      return errorResponse(`You have already performed this action`, 409)
    }

    // High-value actions that need audit logging
    const HIGH_VALUE_ACTIONS: EngagementAction[] = ['SUPPORT', 'SIGN', 'VOLUNTEER', 'CONTACT_REP']

    // Create engagement event
    const engagementEvent = await prisma.engagementEvent.create({
      data: {
        userId: user.id,
        civicItemId: civicItem.id,
        action,
        metadata: metadata || {},
      },
    })

    // For SUPPORT action, increment currentSupport atomically
    let updatedSupport = civicItem.currentSupport
    if (action === 'SUPPORT') {
      const updated = await prisma.civicItem.update({
        where: { id: civicItem.id },
        data: { currentSupport: { increment: 1 } },
        select: { currentSupport: true },
      })
      updatedSupport = updated.currentSupport
    }

    // Create audit log for high-value actions
    if (HIGH_VALUE_ACTIONS.includes(action)) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: `ENGAGEMENT_${action}`,
          entityType: 'CivicItem',
          entityId: civicItem.id,
          metadata: {
            engagementId: engagementEvent.id,
            ...metadata,
          },
          ipHash: null, // TODO: Hash IP address if needed for fraud detection
        },
      })
    }

    // Get updated engagement state
    const allEngagements = await prisma.engagementEvent.findMany({
      where: {
        userId: user.id,
        civicItemId: civicItem.id,
      },
      select: { action: true },
    })

    return successResponse({
      message: `${action} recorded successfully`,
      userEngagement: {
        actions: allEngagements.map((e) => e.action),
        hasSupported: allEngagements.some((e) => e.action === 'SUPPORT'),
        hasSaved: allEngagements.some((e) => e.action === 'SAVE'),
        hasCommented: allEngagements.some((e) => e.action === 'COMMENT'),
      },
      currentSupport: updatedSupport,
    })
  } catch (error: any) {
    console.error('POST /api/civic-items/[slug]/engage error:', error)
    return errorResponse('Failed to record engagement')
  }
}

// Apply middleware: auth → validation → rate limiting
export const POST = compose(
  withRateLimit(
    (req, user) => `engage:${user?.id}`,
    30, // max requests
    60  // per 60 seconds
  ),
  withValidation(engageSchema),
  withAuth
)(handler)
