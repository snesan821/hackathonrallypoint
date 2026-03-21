import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/cache/redis'
import { errorResponse, successResponse } from '@/lib/api/middleware'

/**
 * GET /api/community/impact
 * Get community-level impact statistics
 *
 * Cached for 15 minutes
 */
export async function GET(req: Request) {
  try {
    const cacheKey = 'community:impact'

    // Check cache
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return NextResponse.json(JSON.parse(cached))
      }
    } catch (error) {
      console.error('Redis cache read error:', error)
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Total engagements this week
    const engagementsThisWeek = await prisma.engagementEvent.count({
      where: {
        timestamp: { gte: sevenDaysAgo },
      },
    })

    // Unique users engaged this week
    const uniqueUsersThisWeek = await prisma.engagementEvent.findMany({
      where: {
        timestamp: { gte: sevenDaysAgo },
      },
      distinct: ['userId'],
      select: { userId: true },
    })

    // Trending issues (top 5 by engagement velocity)
    const trendingItems = await prisma.$queryRaw<Array<{
      civicItemId: string
      title: string
      slug: string
      type: string
      engagementCount: bigint
    }>>`
      SELECT ci.id as "civicItemId", ci.title, ci.slug, ci.type, COUNT(ee.id) as "engagementCount"
      FROM "CivicItem" ci
      JOIN "EngagementEvent" ee ON ci.id = ee."civicItemId"
      WHERE ee.timestamp >= ${sevenDaysAgo}
      GROUP BY ci.id, ci.title, ci.slug, ci.type
      ORDER BY "engagementCount" DESC
      LIMIT 5
    `

    const trending = trendingItems.map((item) => ({
      id: item.civicItemId,
      title: item.title,
      slug: item.slug,
      type: item.type,
      engagementCount: Number(item.engagementCount),
    }))

    // Engagement by category
    const engagementsByCategory = await prisma.$queryRaw<Array<{
      category: string
      count: bigint
    }>>`
      SELECT DISTINCT unnest(ci.categories::text[]) as category, COUNT(*) as count
      FROM "EngagementEvent" ee
      JOIN "CivicItem" ci ON ee."civicItemId" = ci.id
      WHERE ee.timestamp >= ${sevenDaysAgo}
      GROUP BY category
      ORDER BY count DESC
    `

    const categoryBreakdown = engagementsByCategory.map((item) => ({
      category: item.category,
      count: Number(item.count),
    }))

    // Calculate milestones
    const milestones: string[] = []

    // Students engaged this week
    const studentUsers = await prisma.user.count({
      where: {
        engagements: {
          some: {
            timestamp: { gte: sevenDaysAgo },
          },
        },
        interests: {
          some: {
            category: { in: ['EDUCATION', 'HOUSING', 'TRANSIT'] },
          },
        },
      },
    })

    if (studentUsers > 0) {
      milestones.push(`${studentUsers} student${studentUsers > 1 ? 's' : ''} engaged this week`)
    }

    // Check for highly supported items
    const highSupportItems = await prisma.civicItem.findMany({
      where: {
        targetSupport: { not: null },
        currentSupport: { gte: prisma.civicItem.fields.targetSupport },
      },
      select: {
        title: true,
        currentSupport: true,
        targetSupport: true,
      },
      take: 3,
    })

    highSupportItems.forEach((item) => {
      if (item.targetSupport) {
        const percentage = Math.round((item.currentSupport / item.targetSupport) * 100)
        milestones.push(`${item.title} reached ${percentage}% of target support`)
      }
    })

    // Active districts (districts with most engagement)
    const activeDistricts = await prisma.$queryRaw<Array<{
      district: string
      count: bigint
    }>>`
      SELECT DISTINCT unnest(ci."districtIds"::text[]) as district, COUNT(*) as count
      FROM "EngagementEvent" ee
      JOIN "CivicItem" ci ON ee."civicItemId" = ci.id
      WHERE ee.timestamp >= ${sevenDaysAgo}
      GROUP BY district
      ORDER BY count DESC
      LIMIT 5
    `

    const activeDistrictsList = activeDistricts.map((item) => ({
      district: item.district,
      engagementCount: Number(item.count),
    }))

    const impact = {
      success: true,
      data: {
        weekSummary: {
          totalEngagements: engagementsThisWeek,
          uniqueUsers: uniqueUsersThisWeek.length,
        },
        trending,
        categoryBreakdown,
        milestones,
        activeDistricts: activeDistrictsList,
      },
    }

    // Cache for 15 minutes
    try {
      await redis.setex(cacheKey, 15 * 60, JSON.stringify(impact))
    } catch (error) {
      console.error('Redis cache write error:', error)
    }

    return NextResponse.json(impact)
  } catch (error: any) {
    console.error('GET /api/community/impact error:', error)
    return errorResponse('Failed to fetch community impact data')
  }
}
