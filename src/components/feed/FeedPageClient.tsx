'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CivicItemCard, CivicItemCardSkeleton } from '@/components/civic/CivicItemCard'
import { LocationPrompt } from '@/components/civic/LocationPrompt'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { Filter, TrendingUp } from 'lucide-react'
import { Category, CivicItemType, EngagementAction } from '@prisma/client'
import type { CivicItemCardRecord } from '@/lib/civic/items'

interface FeedPageClientProps {
  initialItems: CivicItemCardRecord[]
  initialTotalCount: number
  initialHasMore: boolean
  category: Category | null
  type: CivicItemType | null
  sort: string
}

export function FeedPageClient({
  initialItems,
  initialTotalCount,
  initialHasMore,
  category,
  type,
  sort,
}: FeedPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [items, setItems] = useState<CivicItemCardRecord[]>(initialItems)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [locationFilter, setLocationFilter] = useState<{ city?: string; county?: string; state?: string } | null>(null)

  useEffect(() => {
    setItems(initialItems)
    setTotalCount(initialTotalCount)
    setHasMore(initialHasMore)
    setPage(1)
    setIsLoadingMore(false)
  }, [initialHasMore, initialItems, initialTotalCount, category, type, sort])

  // Refetch when location filter changes
  useEffect(() => {
    if (!locationFilter) return

    const fetchWithLocation = async () => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (type) params.set('type', type)
      params.set('sort', sort)
      params.set('page', '1')
      params.set('pageSize', '12')
      if (locationFilter.city) params.set('city', locationFilter.city)
      if (locationFilter.county) params.set('county', locationFilter.county)
      if (locationFilter.state) params.set('state', locationFilter.state)

      try {
        const res = await fetch(`/api/civic-items?${params}`)
        const data = await res.json()
        if (data.success) {
          setItems(data.data)
          setTotalCount(data.pagination?.totalCount || 0)
          setHasMore(data.pagination?.hasMore || false)
          setPage(1)
        }
      } catch (error) {
        console.error('Failed to fetch with location:', error)
      }
    }

    fetchWithLocation()
  }, [locationFilter, category, type, sort])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setIsLoadingMore(true)

    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (type) params.set('type', type)
    params.set('sort', sort)
    params.set('page', nextPage.toString())
    params.set('pageSize', '12')
    if (locationFilter?.city) params.set('city', locationFilter.city)
    if (locationFilter?.county) params.set('county', locationFilter.county)
    if (locationFilter?.state) params.set('state', locationFilter.state)

    try {
      const res = await fetch(`/api/civic-items?${params}`)
      const data = await res.json()

      if (data.success) {
        setItems((prev) => [...prev, ...data.data])
        setPage(nextPage)
        setTotalCount(data.pagination.totalCount)
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch more items:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleEngage = async (itemId: string, action: EngagementAction) => {
    const item = items.find((entry) => entry.id === itemId)
    if (!item) return

    try {
      const res = await fetch(`/api/civic-items/${item.slug}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()

      if (data.success) {
        // Update item with new engagement state
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === itemId
              ? {
                  ...entry,
                  currentSupport: data.data.currentSupport !== undefined ? data.data.currentSupport : entry.currentSupport,
                  userActions: data.data.userEngagement?.actions || entry.userActions || [],
                }
              : entry
          )
        )
      }
    } catch (error) {
      console.error('Engagement failed:', error)
      throw error
    }
  }

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    const query = params.toString()
    router.push(query ? `/feed?${query}` : '/feed')
  }

  return (
    <div className="site-wrap py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-on-surface font-headline">Your Feed</h1>
        <p className="text-on-surface-variant">
          Discover civic issues relevant to your community and interests
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <LocationPrompt
          onLocationResolved={(loc) => setLocationFilter(loc)}
          onLocationCleared={() => {
            setLocationFilter(null)
            setItems(initialItems)
            setTotalCount(initialTotalCount)
            setHasMore(initialHasMore)
            setPage(1)
          }}
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-on-surface-variant" />
          <select
            value={category || ''}
            onChange={(e) => updateFilter('category', e.target.value || null)}
            className="field max-w-[200px] select-none [-webkit-tap-highlight-color:transparent]"
          >
            <option value="">All Categories</option>
            {CIVIC_CATEGORIES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>

        <select
          value={type || ''}
          onChange={(e) => updateFilter('type', e.target.value || null)}
          className="field max-w-[200px] select-none [-webkit-tap-highlight-color:transparent]"
        >
          <option value="">All Types</option>
          <option value="PETITION">Petition</option>
          <option value="BALLOT_INITIATIVE">Ballot Initiative</option>
          <option value="STATE_BILL">State Bill</option>
          <option value="CITY_POLICY">City Policy</option>
          <option value="ORDINANCE">Ordinance</option>
          <option value="PUBLIC_HEARING">Public Hearing</option>
          <option value="SCHOOL_BOARD">School Board</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-on-surface-variant" />
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="field max-w-[180px] select-none [-webkit-tap-highlight-color:transparent]"
          >
            <option value="deadline">Deadline</option>
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="support">Most Supported</option>
          </select>
        </div>
      </div>

      <div className="mb-4 text-sm text-on-surface-variant">
        {totalCount} {totalCount === 1 ? 'issue' : 'issues'} found
        {category && ` in ${CIVIC_CATEGORIES.find((entry) => entry.value === category)?.label}`}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <CivicItemCard
            key={item.id}
            item={item}
            onEngage={(action) => handleEngage(item.id, action)}
          />
        ))}
        {isLoadingMore &&
          Array.from({ length: 3 }).map((_, index) => <CivicItemCardSkeleton key={index} />)}
      </div>

      {!isLoadingMore && items.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
            <Filter className="h-8 w-8 text-on-surface-variant" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-on-surface">No issues found</h3>
          <p className="text-on-surface-variant">
            Try adjusting your filters or check back later for new issues
          </p>
        </div>
      )}

      {hasMore && items.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="btn btn-primary disabled:opacity-50 select-none [-webkit-tap-highlight-color:transparent] transition-all duration-300 ease-in-out active:scale-95"
          >
            {isLoadingMore ? 'Loading more...' : 'Load More Issues'}
          </button>
        </div>
      )}
    </div>
  )
}
