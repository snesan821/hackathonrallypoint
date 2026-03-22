'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CivicItemCard, CivicItemCardSkeleton } from '@/components/civic/CivicItemCard'
import { SwipeStack } from '@/components/discover/SwipeStack'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { Filter, LayoutGrid, Layers } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { renderIcon } from '@/lib/utils/icons'
import type { Category } from '@prisma/client'

type ViewMode = 'swipe' | 'browse'

export default function DiscoverPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('swipe')
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const category = searchParams.get('category') as Category | null
  const search = searchParams.get('q') || ''

  const fetchItems = async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    params.set('pageSize', '20')

    try {
      const res = await fetch(`/api/civic-items?${params}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data)
        setTotalCount(data.pagination?.totalCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (viewMode === 'browse') fetchItems()
  }, [category, search, viewMode])

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/discover?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="mb-1 text-4xl font-bold text-slate-900"
          style={{ fontFamily: 'var(--font-serif, serif)' }}
        >
          Discover
        </h1>
        <p className="text-slate-500">Local campaigns, initiatives, and propositions near you</p>
      </div>

      {/* View mode toggle */}
      <div className="mb-8 flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit">
        <button
          type="button"
          onClick={() => setViewMode('swipe')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            viewMode === 'swipe'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Layers className="h-4 w-4" />
          Swipe
        </button>
        <button
          type="button"
          onClick={() => setViewMode('browse')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            viewMode === 'browse'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Browse
        </button>
      </div>

      {/* SWIPE MODE */}
      {viewMode === 'swipe' && (
        <div className="mx-auto max-w-lg">
          <SwipeStack />
        </div>
      )}

      {/* BROWSE MODE */}
      {viewMode === 'browse' && (
        <>
          {/* Category pills */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateFilter('category', null)}
              className={cn(
                'pill',
                !category ? 'pill-active' : ''
              )}
            >
              All
            </button>
            {CIVIC_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => updateFilter('category', cat.value)}
                className={cn(
                  'pill flex items-center gap-2',
                  category === cat.value ? 'pill-active' : ''
                )}
              >
                {renderIcon(cat.icon, 16, "h-4 w-4")} {cat.label}
              </button>
            ))}
          </div>

          {!isLoading && (
            <p className="mb-4 text-sm text-slate-500">
              {totalCount} {totalCount === 1 ? 'issue' : 'issues'} found
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              items.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => <CivicItemCardSkeleton key={i} />)}
            {items.map((item) => (
              <CivicItemCard key={item.id} item={item} />
            ))}
          </div>

          {!isLoading && items.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
              <Filter className="mx-auto mb-4 h-10 w-10 text-slate-400" />
              <h3 className="mb-2 text-lg font-semibold text-slate-900">No issues found</h3>
              <p className="text-sm text-slate-500">
                Check back later for new civic issues in your area
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
