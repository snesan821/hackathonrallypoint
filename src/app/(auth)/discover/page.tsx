'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CivicItemCard, CivicItemCardSkeleton } from '@/components/civic/CivicItemCard'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { Filter } from 'lucide-react'
import type { Category, EngagementAction } from '@prisma/client'

export default function DiscoverPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
    fetchItems()
  }, [category, search])

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/discover?${params.toString()}`)
  }

  return (
    <div className="site-wrap py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-on-surface font-headline">Discover Issues</h1>
        <p className="text-on-surface-variant">Explore civic issues in your community</p>
      </div>

      {/* Category pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter('category', null)}
          className={!category ? 'pill pill-active' : 'pill'}
        >
          All
        </button>
        {CIVIC_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => updateFilter('category', cat.value)}
            className={category === cat.value ? 'pill pill-active' : 'pill'}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {!isLoading && (
        <p className="mb-4 text-sm text-on-surface-variant">
          {totalCount} {totalCount === 1 ? 'issue' : 'issues'} found
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && items.length === 0 &&
          Array.from({ length: 6 }).map((_, i) => <CivicItemCardSkeleton key={i} />)}
        {items.map((item) => (
          <CivicItemCard key={item.id} item={item} />
        ))}
      </div>

      {!isLoading && items.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
          <Filter className="mx-auto mb-4 h-12 w-12 text-on-surface-variant" />
          <h3 className="mb-2 text-lg font-semibold text-on-surface">No issues found</h3>
          <p className="text-on-surface-variant">Check back later for new civic issues in your area</p>
        </div>
      )}
    </div>
  )
}
