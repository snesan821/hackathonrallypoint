'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SwipeCard, type SwipeItem, type SwipeCardHandle } from './SwipeCard'
import { CategoryBadge } from '@/components/civic/CategoryBadge'
import { ExternalLink, RefreshCw, Inbox, Plus } from 'lucide-react'

const REFETCH_THRESHOLD = 3

interface SwipeStackProps {
  onCategoryChange?: (category: string | null) => void
}

export function SwipeStack({ onCategoryChange }: SwipeStackProps) {
  const [queue, setQueue] = useState<SwipeItem[]>([])
  const [matches, setMatches] = useState<SwipeItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const isFetchingRef = useRef(false)
  const topCardRef = useRef<SwipeCardHandle>(null)

  const fetchBatch = useCallback(async (nextCursor?: string | null) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    try {
      const params = new URLSearchParams()
      if (nextCursor) params.set('cursor', nextCursor)
      const res = await fetch(`/api/swipe?${params}`)
      const data = await res.json()
      if (data.success) {
        const incoming: SwipeItem[] = data.data
        setQueue((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          return [...prev, ...incoming.filter((i) => !existingIds.has(i.id))]
        })
        setCursor(data.nextCursor ?? null)
        if (incoming.length === 0) setIsEmpty(true)
      }
    } catch (err) {
      console.error('SwipeStack fetch error:', err)
    } finally {
      isFetchingRef.current = false
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchBatch(null) }, [fetchBatch])

  useEffect(() => {
    if (!isLoading && queue.length <= REFETCH_THRESHOLD && cursor) fetchBatch(cursor)
    if (!isLoading && queue.length === 0) setIsEmpty(true)
  }, [queue.length, cursor, isLoading, fetchBatch])

  // Right swipe = FOLLOW (maps to SAVE action in backend)
  const recordFollow = useCallback(async (item: SwipeItem) => {
    try {
      await fetch(`/api/civic-items/${item.slug}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE' }),
      })
    } catch {
      // Fire-and-forget
    }
  }, [])

  const recordSkip = useCallback(async (item: SwipeItem) => {
    try {
      await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ civicItemId: item.id, action: 'SKIP' }),
      })
    } catch {}
  }, [])

  // Support button on card face — independent from swipe
  const recordSupport = useCallback(async (item: SwipeItem) => {
    try {
      await fetch(`/api/civic-items/${item.slug}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SUPPORT' }),
      })
    } catch {}
  }, [])

  const handleSwipeLeft = useCallback(() => {
    setQueue((prev) => {
      const [top, ...rest] = prev
      if (top) recordSkip(top)
      return rest
    })
  }, [recordSkip])

  const handleSwipeRight = useCallback(() => {
    setQueue((prev) => {
      const [top, ...rest] = prev
      if (top) {
        recordFollow(top)
        setMatches((m) => {
          // Prevent duplicates in matches array
          if (m.some(item => item.id === top.id)) {
            return m
          }
          return [top, ...m]
        })
      }
      return rest
    })
  }, [recordFollow])

  const handleReset = useCallback(() => {
    setQueue([])
    setMatches([])
    setCursor(null)
    setIsEmpty(false)
    setIsLoading(true)
    isFetchingRef.current = false
    fetchBatch(null)
  }, [fetchBatch])

  const visibleCards = queue.slice(0, 3)

  // Notify parent of top card's category for background color changes
  useEffect(() => {
    const topCategory = visibleCards[0]?.category ?? null
    onCategoryChange?.(topCategory)
  }, [visibleCards[0]?.id, onCategoryChange])

  return (
    <div className="flex flex-col gap-10 pb-6">
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-sm overflow-visible" style={{ height: 480 }}>
          {isLoading && visibleCards.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-card">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
              <p className="text-sm text-on-surface-variant">Loading issues&hellip;</p>
            </div>
          )}

          {!isLoading && isEmpty && visibleCards.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-8 text-center">
              <Inbox className="h-10 w-10 text-on-surface-variant" />
              <div>
                <p className="font-semibold text-on-surface">You&rsquo;re all caught up</p>
                <p className="mt-1 text-sm text-on-surface-variant">No more issues in your queue right now.</p>
              </div>
              <button type="button" onClick={handleReset} className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-all duration-300 ease-in-out select-none [-webkit-tap-highlight-color:transparent] active:scale-95">
                <RefreshCw className="h-4 w-4" />
                Start over
              </button>
            </div>
          )}

          {visibleCards.slice().reverse().map((item, reversedIdx) => {
            const stackIndex = visibleCards.length - 1 - reversedIdx
            return (
              <SwipeCard
                key={item.id}
                ref={stackIndex === 0 ? topCardRef : null}
                item={item}
                isTop={stackIndex === 0}
                stackIndex={stackIndex}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSupport={recordSupport}
              />
            )
          })}
        </div>

        {/* Swipe buttons — X (skip) and + (follow) */}
        {!isLoading && visibleCards.length > 0 && (
          <div className="mt-5 flex items-center justify-center gap-10">
            <button
              type="button"
              aria-label="Skip"
              className="flex h-14 w-14 items-center justify-center text-on-surface-variant transition-all duration-300 ease-in-out hover:scale-110 hover:text-on-surface active:scale-95 select-none [-webkit-tap-highlight-color:transparent]"
              onClick={() => topCardRef.current?.triggerSwipeLeft()}
            >
              <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Follow"
              className="flex h-14 w-14 items-center justify-center text-[var(--co-success)] transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 select-none [-webkit-tap-highlight-color:transparent]"
              onClick={() => topCardRef.current?.triggerSwipeRight()}
            >
              <Plus className="h-9 w-9" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {!isLoading && visibleCards.length > 0 && (
          <p className="mt-4 text-center text-xs text-on-surface-variant">
            Swipe right to follow &middot; swipe left to skip
          </p>
        )}

        {!isLoading && queue.length > 0 && (
          <p className="mt-1 text-center text-xs text-on-surface-variant">
            {queue.length} {queue.length === 1 ? 'issue' : 'issues'} remaining
          </p>
        )}
      </div>

      {/* Following this session */}
      {matches.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-on-surface">Following this session</h2>
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {matches.length}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-outline-variant/15 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest overflow-hidden">
            {matches.map((item) => {
              const contactUrl = item.officialActionUrl || item.sourceUrl
              return (
                <div key={item.id} className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    {(item.categories[0] || item.category) && (
                      <div className="mb-1.5">
                        <CategoryBadge category={item.categories[0] || item.category} size="sm" showIcon={false} />
                      </div>
                    )}
                    <p className="font-semibold text-on-surface leading-snug mb-1 line-clamp-2" style={{ fontFamily: 'var(--font-serif, serif)' }}>
                      {item.title}
                    </p>
                    <p className="text-xs text-on-surface-variant line-clamp-1">
                      {item.jurisdictionTags[0] || item.jurisdictionLevel} &middot; {item.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Link href={`/issues/${item.slug}`} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-on-primary hover:bg-primary-container transition-all duration-300 ease-in-out whitespace-nowrap select-none [-webkit-tap-highlight-color:transparent] active:scale-95">
                      Read article
                    </Link>
                    {contactUrl && (
                      <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-outline-variant/15 bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low transition-all duration-300 ease-in-out whitespace-nowrap select-none [-webkit-tap-highlight-color:transparent] active:scale-95">
                        <ExternalLink className="h-3 w-3" />
                        Source
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 text-center">
            <Link href="/saved" className="text-sm font-medium text-primary hover:text-primary-container transition-all duration-300 ease-in-out select-none [-webkit-tap-highlight-color:transparent]">
              View all followed issues &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
