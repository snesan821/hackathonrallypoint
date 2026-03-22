'use client'

import { useEffect, useState } from 'react'
import { CivicItemCard, CivicItemCardSkeleton } from '@/components/civic/CivicItemCard'
import { EngagementAction } from '@prisma/client'
import { Plus } from 'lucide-react'

export default function FollowingPage() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const fetchFollowing = async (pageNum: number = 1) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/user/saved?page=${pageNum}&pageSize=12`)
      const data = await res.json()
      if (data.success) {
        if (pageNum === 1) setItems(data.data)
        else setItems((prev) => [...prev, ...data.data])
        setTotalCount(data.pagination.totalCount)
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch following items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchFollowing(1) }, [])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchFollowing(nextPage)
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
        // If user unfollowed (UNSAVE), remove from list immediately
        if (action === 'UNSAVE' || (action === 'SAVE' && item.userActions?.includes('SAVE'))) {
          setItems((prev) => prev.filter((i) => i.id !== itemId))
          setTotalCount((prev) => Math.max(0, prev - 1))
        } else {
          // Update item state for other actions
          setItems((prev) =>
            prev.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    currentSupport: data.data.currentSupport !== undefined ? data.data.currentSupport : i.currentSupport,
                    userActions: data.data.userEngagement?.actions || i.userActions || [],
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
    <div className="site-wrap py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-on-surface font-headline">
            <Plus className="h-8 w-8 text-primary" />
            Following
          </h1>
          <p className="text-on-surface-variant">Issues you&rsquo;re following</p>
        </div>
        {totalCount > 0 && (
          <div className="text-sm text-on-surface-variant">
            {totalCount} {totalCount === 1 ? 'issue' : 'issues'} followed
          </div>
        )}
      </div>

      {!isLoading && items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <CivicItemCard key={item.id} item={item} onEngage={(action) => handleEngage(item.id, action)} />
          ))}
        </div>
      )}

      {isLoading && items.length === 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CivicItemCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
            <Plus className="h-8 w-8 text-on-surface-variant" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-on-surface">Not following any issues yet</h3>
          <p className="mb-6 text-on-surface-variant">Follow issues to easily find them later</p>
          <a href="/feed" className="btn btn-primary inline-flex">Explore Issues</a>
        </div>
      )}

      {!isLoading && hasMore && items.length > 0 && (
        <div className="mt-8 text-center">
          <button onClick={handleLoadMore} className="btn btn-primary">Load More</button>
        </div>
      )}

      {isLoading && items.length > 0 && (
        <div className="mt-8 text-center text-sm text-on-surface-variant">Loading more...</div>
      )}
    </div>
  )
}
