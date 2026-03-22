'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Category, CivicItemType, CivicItemStatus, JurisdictionLevel, EngagementAction } from '@prisma/client'
import { CategoryBadge } from './CategoryBadge'
import { SupportBar } from './SupportBar'
import { DeadlineChip } from './DeadlineChip'
import { QuickActions } from './QuickActions'
import { cn } from '@/lib/utils/cn'

export interface CivicItemCardData {
  id: string
  title: string
  slug: string
  category?: Category
  categories: Category[]
  type: CivicItemType
  status: CivicItemStatus
  jurisdictionTags: string[]
  jurisdictionLevel: JurisdictionLevel
  summary: string
  sourceUrl?: string | null
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
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const primaryCategory = item.categories[0] || item.category
  const jurisdiction = item.jurisdictionTags[0] || 'Unknown'

  const handleCardClick = () => {
    router.push(`/issues/${item.slug}`)
  }

  const prefetchDetailPage = () => {
    router.prefetch(`/issues/${item.slug}`)
  }

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-card transition-all duration-300 ease-in-out cursor-pointer select-none [-webkit-tap-highlight-color:transparent]',
        'hover:shadow-card-hover hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98]',
        'w-full',
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={prefetchDetailPage}
    >
      <div className="p-5 pb-0">
        {/* Top metadata row */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {primaryCategory && <CategoryBadge category={primaryCategory} size="sm" showIcon />}
          <span className="rounded bg-surface-container-high px-2 py-0.5 text-xs font-medium text-on-surface-variant">{jurisdiction}</span>
          <span className="rounded bg-surface-container-high px-2 py-0.5 text-xs font-medium text-on-surface-variant">{item.type.replace('_', ' ')}</span>
          {item.status === 'ACTIVE' && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-[var(--co-success)]">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
        </div>

        {/* Title — links to source URL if available, otherwise detail page */}
        {item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/title block"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 line-clamp-2 text-xl font-bold text-on-surface group-hover/title:text-primary group-hover/title:underline">
              {item.title}
              <svg className="ml-1 inline h-4 w-4 text-on-surface-variant group-hover/title:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </h3>
          </a>
        ) : (
          <Link
            href={`/issues/${item.slug}`}
            className="group/title block"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 line-clamp-2 text-xl font-bold text-on-surface group-hover/title:text-primary">
              {item.title}
            </h3>
          </Link>
        )}

        {/* Summary — expandable */}
        <div className="mb-4" onClick={(e) => e.stopPropagation()}>
          <p className={cn(
            'text-sm leading-relaxed text-on-surface-variant',
            !expanded && 'line-clamp-3'
          )}>
            {item.summary}
          </p>
          {item.summary.length > 150 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-container transition-all duration-300 ease-in-out select-none [-webkit-tap-highlight-color:transparent]"
            >
              {expanded ? (
                <><ChevronUp className="h-3.5 w-3.5" />Show less</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" />Read more</>
              )}
            </button>
          )}
        </div>

        {/* Deadline */}
        {item.deadline && (
          <div className="mb-3">
            <DeadlineChip deadline={item.deadline} />
          </div>
        )}

        {/* Support progress */}
        {item.targetSupport && (
          <div className="mb-4">
            <SupportBar currentSupport={item.currentSupport} targetSupport={item.targetSupport} animated />
          </div>
        )}

        {/* Source link button */}
        {item.sourceUrl && (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-all duration-300 ease-in-out select-none [-webkit-tap-highlight-color:transparent] active:scale-95"
            onClick={(e) => e.stopPropagation()}
          >
            View official source / Sign petition
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Quick actions — always visible at bottom */}
      <div className="flex items-center justify-between border-t border-outline-variant/15 px-5 py-4" onClick={(e) => e.stopPropagation()}>
        <QuickActions
          civicItemId={item.id}
          civicItemSlug={item.slug}
          currentSupport={item.currentSupport}
          userActions={item.userActions}
          onEngage={onEngage}
        />

        {item.commentCount !== undefined && item.commentCount > 0 && (
          <Link
            href={`/issues/${item.slug}#comments`}
            className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{item.commentCount}</span>
          </Link>
        )}
      </div>

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
