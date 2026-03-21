'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CivicItemCard, CivicItemCardSkeleton } from '@/components/civic/CivicItemCard'
import { Category, CivicItemType, CivicItemStatus, EngagementAction } from '@prisma/client'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { Filter, TrendingUp } from 'lucide-react'

export default function FeedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Filters from URL
  const category = searchParams.get('category') as Category | null
  const type = searchParams.get('type') as CivicItemType | null
  const sort = searchParams.get('sort') || 'deadline'

  const fetchItems = async (pageNum: number = 1) => {
    setIsLoading(true)

    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (type) params.set('type', type)
    params.set('sort', sort)
    params.set('page', pageNum.toString())
    params.set('pageSize', '12')

    try {
      const res = await fetch(`/api/civic-items?${params}`)
      const data = await res.json()

      if (data.success) {
        if (pageNum === 1) {
          setItems(data.data)
        } else {
          setItems((prev) => [...prev, ...data.data])
        }
        setTotalCount(data.pagination.totalCount)
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchItems(1)
  }, [category, type, sort])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchItems(nextPage)
  }

  const handleEngage = async (itemId: string, action: EngagementAction) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    try {
      const res = await fetch(`/api/civic-items/${item.slug}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (data.success) {
        // Update item in state
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? {
                  ...i,
                  currentSupport: data.data.currentSupport || i.currentSupport,
                  userActions: data.data.userEngagement?.actions || [],
                }
              : i
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
    router.push(`/feed?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Your Feed</h1>
        <p className="text-slate-600">
          Discover civic issues relevant to your community and interests
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-600" />
          <select
            value={category || ''}
            onChange={(e) => updateFilter('category', e.target.value || null)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="">All Categories</option>
            {CIVIC_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter */}
        <select
          value={type || ''}
          onChange={(e) => updateFilter('type', e.target.value || null)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-slate-600" />
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            <option value="deadline">Deadline</option>
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="support">Most Supported</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="mb-4 text-sm text-slate-600">
          {totalCount} {totalCount === 1 ? 'issue' : 'issues'} found
          {category && ` in ${CIVIC_CATEGORIES.find((c) => c.value === category)?.label}`}
        </div>
      )}

      {/* Items grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <CivicItemCard
            key={item.id}
            item={item}
            onEngage={(action) => handleEngage(item.id, action)}
          />
        ))}

        {/* Loading skeletons */}
        {isLoading &&
          items.length === 0 &&
          Array.from({ length: 6 }).map((_, i) => <CivicItemCardSkeleton key={i} />)}
      </div>

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
            <Filter className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">No issues found</h3>
          <p className="text-slate-600">
            Try adjusting your filters or check back later for new issues
          </p>
        </div>
      )}

      {/* Load more */}
      {!isLoading && hasMore && items.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Load More Issues
          </button>
        </div>
      )}

      {/* Loading more indicator */}
      {isLoading && items.length > 0 && (
        <div className="mt-8 text-center text-sm text-slate-600">Loading more...</div>
      )}
    </div>
  )
}
