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

const CATEGORY_BG: Record<string, string> = {
  HOUSING:       'from-blue-100 to-cyan-50',
  EDUCATION:     'from-violet-100 to-purple-50',
  TRANSIT:       'from-emerald-100 to-teal-50',
  PUBLIC_SAFETY: 'from-red-100 to-rose-50',
  HEALTHCARE:    'from-pink-100 to-rose-50',
  JOBS:          'from-amber-100 to-yellow-50',
  ENVIRONMENT:   'from-green-100 to-emerald-50',
  CIVIL_RIGHTS:  'from-indigo-100 to-blue-50',
  CITY_SERVICES: 'from-sky-100 to-cyan-50',
  BUDGET:        'from-yellow-100 to-amber-50',
  ZONING:        'from-orange-100 to-amber-50',
  OTHER:         'from-slate-100 to-gray-50',
}

export default function DiscoverPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('swipe')
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [activeBg, setActiveBg] = useState('from-slate-100 to-gray-50')

  const category = searchParams.get('category') as Category | null
  const search = searchParams.get('q') || ''

  useEffect(() => {
    setActiveBg(category && CATEGORY_BG[category] ? CATEGORY_BG[category] : 'from-slate-100 to-gray-50')
  }, [category])

  const fetchItems = async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    params.set('pageSize', '20')
    try {
      const res = await fetch(`/api/civic-items?${params}`)
      const data = await res.json()
      if (data.success) { setItems(data.data); setTotalCount(data.pagination?.totalCount || 0) }
    } catch { /* silent */ } finally { setIsLoading(false) }
  }

  useEffect(() => { if (viewMode === 'browse') fetchItems() }, [category, search, viewMode])

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    router.push(`/discover?${params.toString()}`)
  }

  return (
    <div className={cn('min-h-screen bg-gradient-to-br transition-all duration-700', activeBg)}>
      {/* ── Header bar ── */}
      <div className="site-wrap pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-headline">Discover Issues</h1>
            <p className="text-xs text-gray-500">Tempe · Phoenix · Maricopa County</p>
          </div>
          {/* Toggle */}
          <div className="flex items-center gap-0.5 rounded-xl border border-black/10 bg-white/80 backdrop-blur-sm p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('swipe')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                viewMode === 'swipe' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <Layers className="h-3.5 w-3.5" /> Swipe
            </button>
            <button
              type="button"
              onClick={() => setViewMode('browse')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                viewMode === 'browse' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Browse
            </button>
          </div>
        </div>
      </div>

      {/* ── SWIPE MODE: full-height deck ── */}
      {viewMode === 'swipe' && (
        <div className="site-wrap pb-6">
          <SwipeStack
            onCategoryChange={(cat) =>
              setActiveBg(cat && CATEGORY_BG[cat] ? CATEGORY_BG[cat] : 'from-slate-100 to-gray-50')
            }
          />
        </div>
      )}

      {/* ── BROWSE MODE ── */}
      {viewMode === 'browse' && (
        <div className="site-wrap pb-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => updateFilter('category', null)} className={cn('pill', !category ? 'pill-active' : '')}>
              All
            </button>
            {CIVIC_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => updateFilter('category', cat.value)}
                className={cn('pill flex items-center gap-1.5', category === cat.value ? 'pill-active' : '')}
              >
                {renderIcon(cat.icon, 14, 'h-3.5 w-3.5')} {cat.label}
              </button>
            ))}
          </div>

          {!isLoading && (
            <p className="mb-4 text-xs text-gray-500">{totalCount} {totalCount === 1 ? 'issue' : 'issues'} found</p>
          )}

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {isLoading && items.length === 0 && Array.from({ length: 6 }).map((_, i) => <CivicItemCardSkeleton key={i} />)}
            {items.map((item) => <CivicItemCard key={item.id} item={item} />)}
          </div>

          {!isLoading && items.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 p-12 text-center">
              <Filter className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="font-semibold text-gray-700">No issues found</p>
              <p className="mt-1 text-sm text-gray-400">Check back later for new civic issues</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
