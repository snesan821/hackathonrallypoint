'use client'

import Link from 'next/link'
import { Category, CivicItemType, CivicItemStatus, JurisdictionLevel, EngagementAction } from '@prisma/client'
import { CategoryBadge } from './CategoryBadge'
import { SupportBar } from './SupportBar'
import { DeadlineChip } from './DeadlineChip'
import { QuickActions } from './QuickActions'
import { cn } from '@/lib/utils/cn'
import { truncate } from '@/lib/utils/format'

export interface CivicItemCardData {
  id: string
  title: string
  slug: string
  categories: Category[]
  type: CivicItemType
  status: CivicItemStatus
  jurisdictionTags: string[]
  jurisdictionLevel: JurisdictionLevel
  summary: string
  deadline: Date | null
  currentSupport: number
  targetSupport: number | null
  allowsOnlineSignature: boolean
  tags: string[]
  districtIds: string[]
  latitude: number | null
  longitude: number | null
  commentCount?: number
  engagementCount?: number
  userActions?: EngagementAction[]
}

interface CivicItemCardProps {
  item: CivicItemCardData
  onEngage?: (action: EngagementAction) => Promise<void>
  className?: string
}

export function CivicItemCard({ item, onEngage, className }: CivicItemCardProps) {
  const primaryCategory = item.categories[0]
  const jurisdiction = item.jurisdictionTags[0] || 'Unknown'

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-card transition-all',
        'hover:shadow-card-hover hover:scale-[1.02] hover:-translate-y-1',
        className
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {primaryCategory && <CategoryBadge category={primaryCategory} size="sm" />}
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="rounded bg-surface-container-high px-2 py-0.5 font-medium">{jurisdiction}</span>
          <span className="rounded bg-surface-container-high px-2 py-0.5 font-medium">{item.type.replace('_', ' ')}</span>
        </div>
        {item.status === 'ACTIVE' && (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-[var(--co-success)]">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
      </div>

      <Link href={`/issues/${item.slug}`} className="group/title block">
        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-on-surface group-hover/title:text-primary">{item.title}</h3>
      </Link>

      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-on-surface-variant">{truncate(item.summary, 180)}</p>

      {item.deadline && (
        <div className="mb-3"><DeadlineChip deadline={item.deadline} /></div>
      )}

      {item.targetSupport && (
        <div className="mb-4"><SupportBar currentSupport={item.currentSupport} targetSupport={item.targetSupport} animated /></div>
      )}

      <div className="flex items-center justify-between border-t border-outline-variant/15 pt-4">
        <QuickActions civicItemId={item.id} civicItemSlug={item.slug} currentSupport={item.currentSupport} userActions={item.userActions} onEngage={onEngage} />
        {item.commentCount !== undefined && item.commentCount > 0 && (
          <Link href={`/issues/${item.slug}#comments`} className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{item.commentCount}</span>
          </Link>
        )}
      </div>

      {item.allowsOnlineSignature && (
        <div className="absolute right-3 top-3 rounded-full bg-[var(--co-success)]/10 px-2.5 py-1 text-xs font-medium text-[var(--co-success)]">
          Sign online
        </div>
      )}
    </article>
  )
}

export function CivicItemCardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-6 w-20 rounded-full skeleton" />
        <div className="h-5 w-16 rounded skeleton" />
        <div className="h-5 w-24 rounded skeleton" />
      </div>
      <div className="mb-2 h-7 w-3/4 rounded skeleton" />
      <div className="mb-4 h-7 w-2/3 rounded skeleton" />
      <div className="mb-2 h-4 w-full rounded skeleton" />
      <div className="mb-2 h-4 w-full rounded skeleton" />
      <div className="mb-4 h-4 w-2/3 rounded skeleton" />
      <div className="mb-4 h-3 w-full rounded-full skeleton" />
      <div className="flex gap-2 border-t border-outline-variant/15 pt-4">
        <div className="h-8 w-20 rounded-lg skeleton" />
        <div className="h-8 w-20 rounded-lg skeleton" />
        <div className="h-8 w-24 rounded-lg skeleton" />
      </div>
    </div>
  )
}
