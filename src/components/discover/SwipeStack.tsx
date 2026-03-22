'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SwipeCard, type SwipeItem, type SwipeCardHandle } from './SwipeCard'
import { CategoryBadge } from '@/components/civic/CategoryBadge'
import { BookmarkCheck, RefreshCw, Inbox, ExternalLink, X, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Category } from '@prisma/client'
import { CIVIC_CATEGORIES } from '@/constants/categories'

type CategoryFilter = Category | 'ALL'

const FILTER_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  ...CIVIC_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
]

const REFETCH_THRESHOLD = 3

export function SwipeStack() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL')
  const [queue, setQueue] = useState<SwipeItem[]>([])
  const [matches, setMatches] = useState<SwipeItem[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)

  // Refs
  const isFetchingRef = useRef(false)
  const topCardHandleRef = useRef<SwipeCardHandle | null>(null)
  // Keep a synchronous mirror of queue so handlers can read current top without stale closure
  const queueRef = useRef<SwipeItem[]>([])
  // Client-side skip tracking — cleared on "Start Over" so items reappear
  const skippedIdsRef = useRef<Set<string>>(new Set())

  // Keep queueRef in sync
  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBatch = useCallback(
    async (nextCursor: string | null, category: CategoryFilter) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      try {
        const params = new URLSearchParams()
        if (nextCursor) params.set('cursor', nextCursor)
        if (category !== 'ALL') params.set('category', category)
        const res = await fetch(`/api/swipe?${params}`)
        const data = await res.json()
        if (data.success) {
          const incoming: SwipeItem[] = data.data
          // Filter out client-side skipped items before adding to queue
          const fresh = incoming.filter((i) => !skippedIdsRef.current.has(i.id))
          setQueue((prev) => {
            const ids = new Set(prev.map((i) => i.id))
            return [...prev, ...fresh.filter((i) => !ids.has(i.id))]
          })
          setCursor(data.nextCursor ?? null)
          if (fresh.length === 0 && incoming.length === 0) setIsEmpty(true)
        }
      } catch (err) {
        console.error('SwipeStack fetch error:', err)
      } finally {
        isFetchingRef.current = false
        setIsLoading(false)
      }
    },
    []
  )

  // Reset on category change
  useEffect(() => {
    topCardHandleRef.current = null
    setQueue([])
    setCursor(null)
    setIsEmpty(false)
    setIsLoading(true)
    isFetchingRef.current = false
    // Don't clear skippedIds on category change — only on explicit "Start Over"
    fetchBatch(null, activeCategory)
  }, [activeCategory, fetchBatch])

  // Auto-fetch more when queue is getting low
  useEffect(() => {
    if (!isLoading && queue.length <= REFETCH_THRESHOLD && cursor) {
      fetchBatch(cursor, activeCategory)
    }
    if (!isLoading && queue.length === 0 && !cursor) setIsEmpty(true)
  }, [queue.length, cursor, isLoading, activeCategory, fetchBatch])

  // ── API calls ──────────────────────────────────────────────────────────────

  const recordSkip = useCallback(async (item: SwipeItem) => {
    try {
      await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ civicItemId: item.id, action: 'SKIP' }),
      })
    } catch { /* fire-and-forget */ }
  }, [])

  const recordSave = useCallback(async (item: SwipeItem) => {
    try {
      await fetch(`/api/civic-items/${item.slug}/engage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE' }),
      })
    } catch { /* fire-and-forget */ }
  }, [])

  // ── Swipe handlers (using queueRef to avoid stale closures) ───────────────

  const handleSwipeLeft = useCallback(() => {
    topCardHandleRef.current = null
    const top = queueRef.current[0]
    if (top) {
      skippedIdsRef.current.add(top.id)
      recordSkip(top)
    }
    setQueue((prev) => prev.slice(1))
  }, [recordSkip])

  const handleSwipeRight = useCallback(() => {
    topCardHandleRef.current = null
    const top = queueRef.current[0]
    if (top) {
      recordSave(top)
      // Update matches separately — never call setState inside another setState updater
      setMatches((m) => (m.find((x) => x.id === top.id) ? m : [top, ...m]))
    }
    setQueue((prev) => prev.slice(1))
  }, [recordSave])

  // ── Button triggers ────────────────────────────────────────────────────────

  const triggerSkip = useCallback(() => {
    topCardHandleRef.current?.triggerLeft()
  }, [])

  const triggerSave = useCallback(() => {
    topCardHandleRef.current?.triggerRight()
  }, [])

  // ── Start Over (clears client-side skip history so items reappear) ─────────

  const handleReset = useCallback(() => {
    topCardHandleRef.current = null
    skippedIdsRef.current = new Set() // clear skip history
    setQueue([])
    setMatches([])
    setCursor(null)
    setIsEmpty(false)
    setIsLoading(true)
    isFetchingRef.current = false
    fetchBatch(null, activeCategory)
  }, [activeCategory, fetchBatch])

  const visibleCards = queue.slice(0, 3)

  return (
    <div className="flex flex-col gap-8">
      {/* Category filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setActiveCategory(opt.value)}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
              activeCategory === opt.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Card stack */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-full" style={{ height: 520 }}>

          {isLoading && visibleCards.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white shadow-card">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
              <p className="text-sm text-slate-500">Loading issues&hellip;</p>
            </div>
          )}

          {!isLoading && isEmpty && visibleCards.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Inbox className="h-10 w-10 text-slate-400" />
              <div>
                <p className="font-semibold text-slate-700">All caught up</p>
                <p className="mt-1 text-sm text-slate-500">
                  No more
                  {activeCategory !== 'ALL'
                    ? ` ${activeCategory.replace(/_/g, ' ').toLowerCase()}`
                    : ''}{' '}
                  issues in your queue.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button type="button" onClick={handleReset} className="btn btn-secondary gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Start over
                </button>
                {activeCategory !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('ALL')}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    Browse all categories
                  </button>
                )}
              </div>
            </div>
          )}

          {visibleCards
            .slice()
            .reverse()
            .map((item, reversedIdx) => {
              const stackIndex = visibleCards.length - 1 - reversedIdx
              const isTop = stackIndex === 0
              return (
                <SwipeCard
                  key={item.id}
                  item={item}
                  isTop={isTop}
                  stackIndex={stackIndex}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onRegister={
                    isTop
                      ? (handle) => { topCardHandleRef.current = handle }
                      : undefined
                  }
                />
              )
            })}
        </div>

        {/* Skip / Save buttons */}
        {!isLoading && visibleCards.length > 0 && (
          <div className="flex items-center justify-center gap-10">
            <button
              type="button"
              aria-label="Skip this issue"
              onClick={triggerSkip}
              className="group flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-200 bg-white shadow-sm transition-all hover:border-slate-400 hover:shadow-md active:scale-95"
            >
              <X className="h-6 w-6 text-slate-500 transition-colors group-hover:text-slate-700" />
            </button>
            <button
              type="button"
              aria-label="Save this issue"
              onClick={triggerSave}
              className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-300 bg-white shadow-sm transition-all hover:border-green-500 hover:shadow-md active:scale-95"
            >
              <Heart className="h-7 w-7 text-green-400 transition-colors group-hover:fill-green-400 group-hover:text-green-600" />
            </button>
          </div>
        )}

        {!isLoading && queue.length > 0 && (
          <p className="text-center text-xs text-slate-400">
            Drag or tap buttons &middot; {queue.length}{' '}
            {queue.length === 1 ? 'issue' : 'issues'} left
          </p>
        )}
      </div>

      {/* Saved matches */}
      {matches.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-slate-900">Saved this session</h2>
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
              {matches.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {matches.map((item) => {
              const contactUrl = item.officialActionUrl || item.sourceUrl
              return (
                <div key={item.id} className="flex items-start gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    {item.categories[0] && (
                      <div className="mb-1.5">
                        <CategoryBadge category={item.categories[0]} size="sm" showIcon={false} />
                      </div>
                    )}
                    <p
                      className="mb-1 line-clamp-2 font-semibold leading-snug text-slate-900"
                      style={{ fontFamily: 'var(--font-serif, serif)' }}
                    >
                      {item.title}
                    </p>
                    <p className="line-clamp-1 text-xs text-slate-500">
                      {item.jurisdictionTags[0] || item.jurisdictionLevel} &middot;{' '}
                      {item.type.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Link
                      href={`/issues/${item.slug}`}
                      className="btn btn-primary whitespace-nowrap px-3 py-1.5 text-xs"
                    >
                      Read article
                    </Link>
                    {contactUrl && (
                      <a
                        href={contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-xs"
                      >
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
            <Link href="/saved" className="text-sm font-medium text-orange-600 hover:text-orange-700">
              View all saved issues &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
