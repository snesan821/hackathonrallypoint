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

    // Get all SAVE and UNSAVE events for this user, ordered by timestamp
    const saveUnsaveEvents = await prisma.engagementEvent.findMany({
      where: {
        userId: user.id,
        action: { in: ['SAVE', 'UNSAVE'] },
      },
      select: {
        civicItemId: true,
        action: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    // Group by civicItemId and find the most recent action for each item
    const latestActionByItem = new Map<string, { action: string; timestamp: Date }>()
    for (const event of saveUnsaveEvents) {
      if (!latestActionByItem.has(event.civicItemId)) {
        latestActionByItem.set(event.civicItemId, {
          action: event.action,
          timestamp: event.timestamp,
        })
      }
    }

    // Filter to only items where the most recent action is SAVE
    const savedItemsWithTimestamp = Array.from(latestActionByItem.entries())
      .filter(([_, data]) => data.action === 'SAVE')
      .map(([civicItemId, data]) => ({ civicItemId, timestamp: data.timestamp }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    const totalCount = savedItemsWithTimestamp.length

    // Paginate the saved items
    const paginatedSavedItems = savedItemsWithTimestamp.slice(
      (page - 1) * pageSize,
      page * pageSize
    )

    const paginatedIds = paginatedSavedItems.map((item) => item.civicItemId)

    if (paginatedIds.length === 0) {
      return NextResponse.json(buildPaginatedResponse([], { page, pageSize, totalCount }))
    }

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

    // Get engagement count statistics for these items
    const engagementCounts = await prisma.engagementEvent.groupBy({
      by: ['civicItemId', 'action'],
      where: {
        civicItemId: { in: paginatedIds },
      },
      _count: {
        action: true,
      },
    })

    // Map engagement counts to items
    const statsMap = new Map<string, { viewCount: number; saveCount: number; supporterCount: number }>()
    for (const count of engagementCounts) {
      if (!statsMap.has(count.civicItemId)) {
        statsMap.set(count.civicItemId, { viewCount: 0, saveCount: 0, supporterCount: 0 })
      }
      const stats = statsMap.get(count.civicItemId)!
      if (count.action === 'VIEW') stats.viewCount = count._count.action
      if (count.action === 'SAVE') stats.saveCount = count._count.action
      if (count.action === 'SUPPORT') stats.supporterCount = count._count.action
    }

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

    // Create timestamp map for sorting
    const savedTimestampMap = new Map(
      paginatedSavedItems.map((item) => [item.civicItemId, item.timestamp])
    )

    // Sort items by save timestamp (already sorted, but maintain order)
    items.sort((a, b) => {
      const aTime = savedTimestampMap.get(a.id)?.getTime() || 0
      const bTime = savedTimestampMap.get(b.id)?.getTime() || 0
      return bTime - aTime
    })

    // Transform to card format with engagement stats
    const cardData = items.map((item) => {
      const stats = statsMap.get(item.id) || { viewCount: 0, saveCount: 0, supporterCount: 0 }
      return {
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
        viewCount: stats.viewCount,
        saveCount: stats.saveCount,
        supporterCount: stats.supporterCount,
        userActions: engagementsByItem.get(item.id) || [],
        savedAt: savedTimestampMap.get(item.id),
      }
    })

    const response = buildPaginatedResponse(cardData, { page, pageSize, totalCount })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GET /api/user/saved error:', error)
    return errorResponse('Failed to fetch saved items')
  }
}
