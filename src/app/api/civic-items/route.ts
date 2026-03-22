import { NextResponse } from 'next/server'
import { redis } from '@/lib/cache/redis'
import { getCurrentUser } from '@/lib/auth/server'
import { getSearchParams, buildPaginatedResponse } from '@/lib/api/middleware'
import { Category, CivicItemType, CivicItemStatus, JurisdictionLevel } from '@prisma/client'
import { getCivicItemsPage } from '@/lib/civic/items'

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
 * - city: Filter by city (from browser geolocation)
 * - state: Filter by state (from browser geolocation)
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
    const city = searchParams.get('city')
    const county = searchParams.get('county')
    const state = searchParams.get('state')
    const sort = searchParams.get('sort') || 'deadline'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    // Get current user for personalization (optional)
    const user = await getCurrentUser()

    // Build cache key
    const cacheKey = `feed:${category || 'all'}:${type || 'all'}:${status || 'all'}:${jurisdiction || 'all'}:${jurisdictionLevel || 'all'}:${search || 'none'}:${city || 'all'}:${county || 'all'}:${state || 'all'}:${sort}:${page}:${pageSize}:${user?.id || 'anon'}`

    // Check cache (5 minute TTL)
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return NextResponse.json(JSON.parse(cached))
      }
    } catch (error) {
      console.error('Redis cache read error:', error)
    }

    const result = await getCivicItemsPage(
      {
        category,
        type,
        status,
        jurisdiction,
        jurisdictionLevel,
        search,
        city,
        county,
        state,
        sort: sort as 'deadline' | 'newest' | 'trending' | 'support',
        page,
        pageSize,
      },
      user?.id
    )

    const response = buildPaginatedResponse(result.items, {
      page: result.page,
      pageSize: result.pageSize,
      totalCount: result.totalCount,
    })

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
