import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/server'
import { errorResponse } from '@/lib/api/middleware'
import { z } from 'zod'

const BATCH_SIZE = 10

/**
 * GET /api/swipe
 * Returns a batch of civic items the user has not yet SUPPORT'd or SKIP'd.
 * Query params:
 *   - cursor: last civicItemId seen (for pagination, optional)
 */
export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor') || undefined

    // IDs of items already acted on (SUPPORT or SKIP)
    const seenEngagements = await prisma.engagementEvent.findMany({
      where: {
        userId: user.id,
        action: { in: ['SUPPORT', 'SKIP'] },
      },
      select: { civicItemId: true },
    })
    const seenIds = seenEngagements.map((e) => e.civicItemId)

    const items = await prisma.civicItem.findMany({
      where: {
        status: 'ACTIVE',
        id: {
          notIn: seenIds.length > 0 ? seenIds : undefined,
          ...(cursor ? { gt: cursor } : {}),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: BATCH_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        categories: true,
        type: true,
        status: true,
        jurisdictionTags: true,
        jurisdictionLevel: true,
        summary: true,
        deadline: true,
        currentSupport: true,
        targetSupport: true,
        allowsOnlineSignature: true,
        tags: true,
        isVerified: true,
        sourceUrl: true,
        officialActionUrl: true,
        aiSummary: {
          select: {
            plainSummary: true,
            whoAffected: true,
            whyItMatters: true,
          },
        },
      },
    })

    const nextCursor = items.length === BATCH_SIZE ? items[items.length - 1].id : null

    return NextResponse.json({ success: true, data: items, nextCursor })
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return errorResponse('Unauthorized', 401)
    console.error('GET /api/swipe error:', error)
    return errorResponse('Failed to load swipe queue')
  }
}

const swipeSchema = z.object({
  civicItemId: z.string().uuid(),
  action: z.enum(['SUPPORT', 'SKIP']),
})

/**
 * POST /api/swipe
 * Records a swipe action (SUPPORT = right, SKIP = left).
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const validation = swipeSchema.safeParse(body)
    if (!validation.success) return errorResponse('Invalid request', 400)

    const { civicItemId, action } = validation.data

    // Upsert ΓÇö if they already acted on this item (e.g. re-swiped), just update
    await prisma.engagementEvent.upsert({
      where: { userId_civicItemId_action: { userId: user.id, civicItemId, action } },
      create: { userId: user.id, civicItemId, action },
      update: {},
    })

    // Increment support counter for right swipes
    if (action === 'SUPPORT') {
      // Avoid double-counting if they somehow hit this twice
      const existing = await prisma.engagementEvent.count({
        where: { userId: user.id, civicItemId, action: 'SUPPORT' },
      })
      if (existing === 1) {
        await prisma.civicItem.update({
          where: { id: civicItemId },
          data: { currentSupport: { increment: 1 } },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) return errorResponse('Unauthorized', 401)
    console.error('POST /api/swipe error:', error)
    return errorResponse('Failed to record swipe')
  }
}
