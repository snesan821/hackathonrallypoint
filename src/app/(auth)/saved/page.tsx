'use client'

import { useEffect, useState } from 'react'
import { CivicItemCard, CivicItemCardSkeleton } from '@/components/civic/CivicItemCard'
import { EngagementAction } from '@prisma/client'
import { Bookmark, X } from 'lucide-react'

export default function SavedPage() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const fetchSaved = async (pageNum: number = 1) => {
    setIsLoading(true)

    try {
      const res = await fetch(`/api/user/saved?page=${pageNum}&pageSize=12`)
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
      console.error('Failed to fetch saved items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSaved(1)
  }, [])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchSaved(nextPage)
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
        // If unsaving, remove from list
        if (action === 'SAVE' && item.userActions?.includes('SAVE')) {
          setItems((prev) => prev.filter((i) => i.id !== itemId))
          setTotalCount((prev) => prev - 1)
        } else {
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
      }
    } catch (error) {
      console.error('Engagement failed:', error)
      throw error
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-slate-900">
            <Bookmark className="h-8 w-8 text-orange-600" />
            Saved Issues
          </h1>
          <p className="text-slate-600">
            Issues you've bookmarked for later review
          </p>
        </div>
        {totalCount > 0 && (
          <div className="text-sm text-slate-600">
            {totalCount} {totalCount === 1 ? 'item' : 'items'} saved
          </div>
        )}
      </div>

      {/* Items grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <CivicItemCard
                item={item}
                onEngage={(action) => handleEngage(item.id, action)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && items.length === 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CivicItemCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
            <Bookmark className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            No saved issues yet
          </h3>
          <p className="mb-6 text-slate-600">
            Bookmark issues to easily find them later
          </p>
          <a
            href="/feed"
            className="inline-block rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Explore Issues
          </a>
        </div>
      )}

      {/* Load more */}
      {!isLoading && hasMore && items.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Load More
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
