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

    const items = await prisma.civicItem.findMany({
      where: {
        status: 'ACTIVE',
        engagements: {
          none: {
            userId: user.id,
            action: { in: ['SUPPORT', 'SKIP'] },
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      take: BATCH_SIZE,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
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
        _count: {
          select: {
            engagements: true,
          },
        },
      },
    })

    // Enrich items with per-action engagement counts
    const itemIds = items.map((i) => i.id)
    const engagementCounts = itemIds.length > 0
      ? await prisma.engagementEvent.groupBy({
          by: ['civicItemId', 'action'],
          where: { civicItemId: { in: itemIds } },
          _count: { action: true },
        })
      : []

    const countMap = new Map<string, { views: number; saves: number; supporters: number }>()
    for (const e of engagementCounts) {
      const entry = countMap.get(e.civicItemId) ?? { views: 0, saves: 0, supporters: 0 }
      if (e.action === 'VIEW') entry.views = e._count.action
      else if (e.action === 'SAVE') entry.saves = e._count.action
      else if (e.action === 'SUPPORT') entry.supporters = e._count.action
      countMap.set(e.civicItemId, entry)
    }

    const enrichedItems = items.map((item) => {
      const counts = countMap.get(item.id) ?? { views: 0, saves: 0, supporters: 0 }
      return {
        ...item,
        viewCount: counts.views,
        saveCount: counts.saves,
        supporterCount: counts.supporters,
      }
    })

    const nextCursor = items.length === BATCH_SIZE ? items[items.length - 1].id : null

    return NextResponse.json({ success: true, data: enrichedItems, nextCursor })
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
