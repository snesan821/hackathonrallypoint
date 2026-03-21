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
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/feed?${params.toString()}`)
  }

  return (
    <div className="site-wrap py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-on-surface font-headline">Your Feed</h1>
        <p className="text-on-surface-variant">
          Discover civic issues relevant to your community and interests
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-on-surface-variant" />
          <select
            value={category || ''}
            onChange={(e) => updateFilter('category', e.target.value || null)}
            className="field max-w-[200px]"
          >
            <option value="">All Categories</option>
            {CIVIC_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <select
          value={type || ''}
          onChange={(e) => updateFilter('type', e.target.value || null)}
          className="field max-w-[200px]"
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
            className="field max-w-[180px]"
          >
            <option value="deadline">Deadline</option>
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="support">Most Supported</option>
          </select>
        </div>
      </div>

      {!isLoading && (
        <div className="mb-4 text-sm text-on-surface-variant">
          {totalCount} {totalCount === 1 ? 'issue' : 'issues'} found
          {category && ` in ${CIVIC_CATEGORIES.find((c) => c.value === category)?.label}`}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <CivicItemCard
            key={item.id}
            item={item}
            onEngage={(action) => handleEngage(item.id, action)}
          />
        ))}
        {isLoading && items.length === 0 &&
          Array.from({ length: 6 }).map((_, i) => <CivicItemCardSkeleton key={i} />)}
      </div>

      {!isLoading && items.length === 0 && (
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

      {!isLoading && hasMore && items.length > 0 && (
        <div className="mt-8 text-center">
          <button onClick={handleLoadMore} className="btn btn-primary">
            Load More Issues
          </button>
        </div>
      )}

      {isLoading && items.length > 0 && (
        <div className="mt-8 text-center text-sm text-on-surface-variant">Loading more...</div>
      )}
    </div>
  )
}
