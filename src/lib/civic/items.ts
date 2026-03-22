import { prisma } from '@/lib/db/prisma'
import {
  Category,
  CivicItemStatus,
  CivicItemType,
  JurisdictionLevel,
  type EngagementAction,
} from '@prisma/client'

export type CivicItemsSort = 'deadline' | 'newest' | 'trending' | 'support'

export interface CivicItemsQuery {
  category?: Category | null
  type?: CivicItemType | null
  status?: CivicItemStatus | null
  jurisdiction?: string | null
  jurisdictionLevel?: JurisdictionLevel | null
  search?: string | null
  city?: string | null
  county?: string | null
  state?: string | null
  sort?: CivicItemsSort
  page?: number
  pageSize?: number
}

export interface CivicItemCardRecord {
  id: string
  title: string
  slug: string
  categories: Category[]
  type: CivicItemType
  status: CivicItemStatus
  jurisdictionTags: string[]
  jurisdictionLevel: JurisdictionLevel
  summary: string
  sourceUrl: string | null
  deadline: Date | null
  currentSupport: number
  targetSupport: number | null
  allowsOnlineSignature: boolean
  tags: string[]
  districtIds: string[]
  latitude: number | null
  longitude: number | null
  commentCount: number
  engagementCount: number
  createdAt: Date
  userActions?: EngagementAction[]
}

export interface CivicItemsResult {
  items: CivicItemCardRecord[]
  totalCount: number
  page: number
  pageSize: number
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((entry): entry is string => typeof entry === 'string')
}

export async function getCivicItemsPage(
  query: CivicItemsQuery,
  userId?: string
): Promise<CivicItemsResult> {
  const {
    category = null,
    type = null,
    status = null,
    jurisdiction = null,
    jurisdictionLevel = null,
    search = null,
    city = null,
    county = null,
    state = null,
    sort = 'deadline',
  } = query

  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 20))

  const where: Record<string, unknown> = {}

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

  // Location-based: don't filter out, we'll score and sort after fetching
  // so city-level items appear first, then county, then state, then the rest

  let orderBy: Array<Record<string, unknown>> = []

  if (sort === 'deadline') {
    orderBy = [
      { deadline: { sort: 'asc', nulls: 'last' } },
      { createdAt: 'desc' },
    ]
  } else if (sort === 'newest') {
    orderBy = [{ createdAt: 'desc' }]
  } else if (sort === 'support') {
    orderBy = [{ currentSupport: 'desc' }, { createdAt: 'desc' }]
  } else {
    orderBy = [{ createdAt: 'desc' }]
  }

  const [totalCount, rawItems, userPreferences] = await Promise.all([
    prisma.civicItem.count({ where }),
    prisma.civicItem.findMany({
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
    }),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: {
            addresses: {
              where: { isPrimary: true },
              take: 1,
              select: { districtIds: true },
            },
            interests: {
              select: { category: true },
            },
          },
        })
      : Promise.resolve(null),
  ])

  let items = rawItems

  if (sort === 'trending' && items.length > 0) {
    const recentCounts = await prisma.engagementEvent.groupBy({
      by: ['civicItemId'],
      where: {
        civicItemId: { in: items.map((item) => item.id) },
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      _count: {
        _all: true,
      },
    })

    const velocityById = new Map(
      recentCounts.map((entry) => [entry.civicItemId, entry._count._all])
    )

    items = [...items].sort(
      (a, b) => (velocityById.get(b.id) ?? 0) - (velocityById.get(a.id) ?? 0)
    )
  }

  if (userPreferences && items.length > 0) {
    const userCategories = userPreferences.interests.map((interest) => interest.category)
    const userDistrictIds = toStringArray(userPreferences.addresses[0]?.districtIds)

    if (userCategories.length > 0 || userDistrictIds.length > 0) {
      const itemsWithRelevance = items.map((item) => {
        const matchingCategories = item.categories.filter((itemCategory) =>
          userCategories.includes(itemCategory)
        )
        const itemDistrictIds = toStringArray(item.districtIds)
        const matchingDistricts = itemDistrictIds.filter((districtId) =>
          userDistrictIds.includes(districtId)
        )

        return {
          ...item,
          relevanceScore: matchingCategories.length * 10 + matchingDistricts.length * 20,
        }
      })

      if (itemsWithRelevance.some((item) => item.relevanceScore > 0)) {
        items = itemsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore)
      }
    }
  }

  // ── Location proximity sorting ──
  // City match > county match > state match > no match
  if ((city || county || state) && items.length > 0) {
    const lowerCity = city?.toLowerCase()
    const lowerCounty = county?.toLowerCase()
    const lowerState = state?.toLowerCase()

    const scored = items.map((item) => {
      const tags = item.jurisdictionTags.map((t) => t.toLowerCase())
      let geoScore = 0

      if (lowerCity && tags.includes(lowerCity)) geoScore = 30
      else if (lowerCounty && tags.includes(lowerCounty)) geoScore = 20
      else if (lowerState && tags.includes(lowerState)) geoScore = 10

      return { ...item, geoScore }
    })

    items = scored.sort((a, b) => b.geoScore - a.geoScore)
  }

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      categories: item.categories,
      type: item.type,
      status: item.status,
      jurisdictionTags: item.jurisdictionTags,
      jurisdictionLevel: item.jurisdictionLevel,
      summary: item.summary,
      sourceUrl: item.sourceUrl,
      deadline: item.deadline,
      currentSupport: item.currentSupport,
      targetSupport: item.targetSupport,
      allowsOnlineSignature: item.allowsOnlineSignature,
      tags: item.tags,
      districtIds: toStringArray(item.districtIds),
      latitude: item.latitude,
      longitude: item.longitude,
      commentCount: item._count.comments,
      engagementCount: item._count.engagements,
      createdAt: item.createdAt,
    })),
    totalCount,
    page,
    pageSize,
  }
}
