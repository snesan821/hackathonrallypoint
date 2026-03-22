'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CivicItemCard, CivicItemCardSkeleton } from '@/components/civic/CivicItemCard'
import { SwipeStack } from '@/components/discover/SwipeStack'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { Filter, LayoutGrid, Layers } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { renderIcon } from '@/lib/utils/icons'
import { LocationPrompt } from '@/components/civic/LocationPrompt'
import type { Category } from '@prisma/client'

type ViewMode = 'swipe' | 'browse'

export default function DiscoverPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('swipe')
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [locationFilter, setLocationFilter] = useState<{ city?: string; county?: string; state?: string } | null>(null)

  const category = searchParams.get('category') as Category | null
  const search = searchParams.get('q') || ''

  const fetchItems = async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (locationFilter?.city) params.set('city', locationFilter.city)
    if (locationFilter?.county) params.set('county', locationFilter.county)
    if (locationFilter?.state) params.set('state', locationFilter.state)
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
  }, [category, search, viewMode, locationFilter])

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/discover?${params.toString()}`)
  }

  return (
    <div className="site-wrap py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-on-surface font-headline">Discover Issues</h1>
        <p className="text-on-surface-variant">Local campaigns, initiatives, and propositions near you</p>
      </div>

      {/* Location prompt */}
      <div className="mb-6">
        <LocationPrompt
          onLocationResolved={(loc) => setLocationFilter(loc)}
          onLocationCleared={() => setLocationFilter(null)}
        />
      </div>

      {/* View mode toggle */}
      <div className="mb-8 flex items-center gap-1 rounded-xl border border-outline-variant/15 bg-surface-container-low p-1 w-fit">
        <button
          type="button"
          onClick={() => setViewMode('swipe')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            viewMode === 'swipe'
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
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
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
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
              className={cn('pill', !category ? 'pill-active' : '')}
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
            <p className="mb-4 text-sm text-on-surface-variant">
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
            <div className="rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
              <Filter className="mx-auto mb-4 h-12 w-12 text-on-surface-variant" />
              <h3 className="mb-2 text-lg font-semibold text-on-surface">No issues found</h3>
              <p className="text-on-surface-variant">
                Check back later for new civic issues in your area
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
