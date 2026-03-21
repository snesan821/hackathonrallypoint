import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { redis } from '@/lib/cache/redis'
import { getCurrentUser } from '@/lib/auth/server'
import { getSearchParams, buildPaginatedResponse } from '@/lib/api/middleware'
import { Category, CivicItemType, CivicItemStatus, JurisdictionLevel } from '@prisma/client'

/**
 * GET /api/civic-items
 * Get paginated, filtered feed of civic items
 *
 * Query params:
 * - category: Category enum filter
 * - type: CivicItemType enum filter
 * - status: CivicItemStatus enum filter
 * - jurisdiction: Specific jurisdiction tag
 * - jurisdictionLevel: JurisdictionLevel enum filter
 * - search: Text search in title/summary
 * - sort: deadline | newest | trending | support
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20, max: 50)
 */
export async function GET(req: Request) {
  try {
    const searchParams = getSearchParams(req)

    // Extract filter parameters
    const category = searchParams.get('category') as Category | null
    const type = searchParams.get('type') as CivicItemType | null
    const status = searchParams.get('status') as CivicItemStatus | null
    const jurisdiction = searchParams.get('jurisdiction')
    const jurisdictionLevel = searchParams.get('jurisdictionLevel') as JurisdictionLevel | null
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'deadline'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    // Get current user for personalization (optional)
    const user = await getCurrentUser()

    // Build cache key
    const cacheKey = `feed:${category || 'all'}:${type || 'all'}:${status || 'all'}:${jurisdiction || 'all'}:${jurisdictionLevel || 'all'}:${search || 'none'}:${sort}:${page}:${pageSize}:${user?.id || 'anon'}`

    // Check cache (5 minute TTL)
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return NextResponse.json(JSON.parse(cached))
      }
    } catch (error) {
      console.error('Redis cache read error:', error)
    }

    // Build where clause
    const where: any = {}

    if (category) {
      where.categories = { has: category }
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (jurisdiction) {
      where.jurisdictionTags = { has: jurisdiction }
    }

    if (jurisdictionLevel) {
      where.jurisdictionLevel = jurisdictionLevel
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ]
    }

    // If user is authenticated, boost items in their districts and interests
    let orderBy: any[] = []

    if (sort === 'deadline') {
      orderBy = [
        { deadline: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' },
      ]
    } else if (sort === 'newest') {
      orderBy = [{ createdAt: 'desc' }]
    } else if (sort === 'support') {
      orderBy = [{ currentSupport: 'desc' }, { createdAt: 'desc' }]
    } else if (sort === 'trending') {
      // For trending, we'll fetch all and sort by engagement velocity
      // This is less efficient but works for MVP
      orderBy = [{ createdAt: 'desc' }]
    }

    // Get total count
    const totalCount = await prisma.civicItem.count({ where })

    // Fetch items
    let items = await prisma.civicItem.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: {
            comments: true,
            engagements: true,
          },
        },
      },
    })

    // If trending sort, calculate engagement velocity and re-sort
    if (sort === 'trending') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const itemsWithVelocity = await Promise.all(
        items.map(async (item) => {
          const recentEngagements = await prisma.engagementEvent.count({
            where: {
              civicItemId: item.id,
              timestamp: { gte: sevenDaysAgo },
            },
          })

          return { ...item, velocity: recentEngagements }
        })
      )

      items = itemsWithVelocity.sort((a, b) => b.velocity - a.velocity) as any
    }

    // If user is authenticated, boost items matching their interests and districts
    if (user) {
      const userWithPreferences = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          addresses: {
            where: { isPrimary: true },
            take: 1,
          },
          interests: true,
        },
      })

      if (userWithPreferences) {
        const userCategories = userWithPreferences.interests.map((i) => i.category)
        const userDistrictIds = userWithPreferences.addresses[0]?.districtIds as string[] || []

        // Calculate relevance score and re-sort
        const itemsWithRelevance = items.map((item) => {
          let relevanceScore = 0

          // Boost if item matches user's interests
          const itemCategories = item.categories as Category[]
          const matchingCategories = itemCategories.filter((cat) =>
            userCategories.includes(cat)
          )
          relevanceScore += matchingCategories.length * 10

          // Boost if item is in user's districts
          const itemDistrictIds = item.districtIds as string[]
          const matchingDistricts = itemDistrictIds.filter((dist) =>
            userDistrictIds.includes(dist)
          )
          relevanceScore += matchingDistricts.length * 20

          return { ...item, relevanceScore }
        })

        // Re-sort by relevance if any items are relevant
        if (itemsWithRelevance.some((i) => i.relevanceScore > 0)) {
          items = itemsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore) as any
        }
      }
    }

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
      createdAt: item.createdAt,
    }))

    const response = buildPaginatedResponse(cardData, { page, pageSize, totalCount })

    // Cache the response
    try {
      await redis.setex(cacheKey, 5 * 60, JSON.stringify(response))
    } catch (error) {
      console.error('Redis cache write error:', error)
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GET /api/civic-items error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch civic items' },
      { status: 500 }
    )
  }
}
