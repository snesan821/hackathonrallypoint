import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/server'
import { errorResponse, successResponse } from '@/lib/api/middleware'
import { redis } from '@/lib/cache/redis'
import { z } from 'zod'
import { EngagementAction } from '@prisma/client'

const engageSchema = z.object({
  action: z.nativeEnum(EngagementAction),
  metadata: z.record(z.string(), z.any()).optional(),
})

/**
 * POST /api/civic-items/[slug]/engage
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth()

    // Rate limit: 30 engagements per 60 seconds per user
    try {
      const rlKey = `ratelimit:engage:${user.id}`
      const now = Date.now()
      const windowMs = 60 * 1000
      await redis.zremrangebyscore(rlKey, 0, now - windowMs)
      const count = await redis.zcard(rlKey)
      if (count >= 30) {
        const oldest = await redis.zrange(rlKey, 0, 0, 'WITHSCORES')
        const retryAfter = oldest[1]
          ? Math.ceil((Number(oldest[1]) + windowMs - now) / 1000)
          : 60
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded', retryAfter },
          { status: 429, headers: { 'Retry-After': retryAfter.toString(), 'X-RateLimit-Limit': '30', 'X-RateLimit-Remaining': '0' } }
        )
      }
      await redis.zadd(rlKey, now, `${now}-${Math.random()}`)
      await redis.expire(rlKey, 60)
    } catch {
      // Redis unavailable — allow request through (fail open)
    }

    const { slug } = await params
    const rawBody = await req.json()
    const validation = engageSchema.safeParse(rawBody)
    if (!validation.success) return errorResponse('Invalid request format', 400)
    const { action, metadata } = validation.data

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

    // Check for UNSAVE action (toggle off SAVE)
    if (action === 'UNSAVE') {
      // Find and delete the SAVE engagement
      const saveEngagement = await prisma.engagementEvent.findFirst({
        where: {
          userId: user.id,
          civicItemId: civicItem.id,
          action: 'SAVE',
        },
      })

      if (!saveEngagement) {
        return errorResponse('No save engagement found to remove', 404)
      }

      // Delete engagement
      await prisma.engagementEvent.delete({
        where: { id: saveEngagement.id },
      })

      // Invalidate cache
      try {
        await redis.del(`civic_item:${slug}`)
        await redis.del(`user:${user.id}:saved`)
      } catch {
        // Redis unavailable - continue
      }

      // Get updated engagement state
      const remainingEngagements = await prisma.engagementEvent.findMany({
        where: {
          userId: user.id,
          civicItemId: civicItem.id,
        },
        select: { action: true },
      })

      return successResponse({
        message: 'Item unfollowed',
        userEngagement: {
          actions: remainingEngagements.map((e) => e.action),
          hasSupported: remainingEngagements.some((e) => e.action === 'SUPPORT'),
          hasSaved: false,
        },
        currentSupport: civicItem.currentSupport,
      })
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

      // Invalidate cache
      try {
        await redis.del(`civic_item:${slug}`)
        await redis.del(`user:${user.id}:impact`)
      } catch {
        // Redis unavailable - continue
      }

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

        // Invalidate cache
        try {
          await redis.del(`civic_item:${slug}`)
          await redis.del(`user:${user.id}:saved`)
        } catch {
          // Redis unavailable - continue
        }

        const remainingEngagements = await prisma.engagementEvent.findMany({
          where: {
            userId: user.id,
            civicItemId: civicItem.id,
          },
          select: { action: true },
        })

        return successResponse({
          message: 'Item unfollowed',
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

    // Invalidate relevant caches
    try {
      await redis.del(`civic_item:${slug}`)
      if (action === 'SAVE') {
        await redis.del(`user:${user.id}:saved`)
      }
      if (HIGH_VALUE_ACTIONS.includes(action)) {
        await redis.del(`user:${user.id}:impact`)
      }
    } catch {
      // Redis unavailable - continue
    }

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
