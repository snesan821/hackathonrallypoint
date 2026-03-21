'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { CategoryBadge } from '@/components/civic/CategoryBadge'
import { cn } from '@/lib/utils/cn'
import { ExternalLink, Calendar, Users, CheckCircle2 } from 'lucide-react'
import type { Category, CivicItemType, JurisdictionLevel } from '@prisma/client'

export interface SwipeItem {
  id: string
  title: string
  slug: string
  category: Category
  categories: Category[]
  type: CivicItemType
  jurisdictionTags: string[]
  jurisdictionLevel: JurisdictionLevel
  summary: string
  deadline: string | null
  currentSupport: number
  targetSupport: number | null
  isVerified: boolean
  sourceUrl?: string | null
  officialActionUrl?: string | null
  aiSummary?: {
    plainSummary: string | null
    whoAffected: string | null
    whyItMatters: string | null
  } | null
}

interface SwipeCardProps {
  item: SwipeItem
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
  stackIndex: number
}

const SWIPE_THRESHOLD = 80
const ROTATION_FACTOR = 0.07
const EXIT_X = 640

export function SwipeCard({ item, onSwipeLeft, onSwipeRight, isTop, stackIndex }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const isDraggingRef = useRef(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isTop) return
      isDraggingRef.current = true
      startXRef.current = e.clientX
      currentXRef.current = e.clientX
      setIsDragging(true)
      cardRef.current?.setPointerCapture(e.pointerId)
    },
    [isTop]
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    currentXRef.current = e.clientX
    setDragX(e.clientX - startXRef.current)
  }, [])

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
    const delta = currentXRef.current - startXRef.current
    if (delta > SWIPE_THRESHOLD) {
      setDragX(EXIT_X)
      setTimeout(onSwipeRight, 280)
    } else if (delta < -SWIPE_THRESHOLD) {
      setDragX(-EXIT_X)
      setTimeout(onSwipeLeft, 280)
    } else {
      setDragX(0)
    }
  }, [onSwipeLeft, onSwipeRight])

  // Trigger swipe via buttons (keyboard/desktop)
  const triggerSwipeRight = useCallback(() => {
    setDragX(EXIT_X)
    setTimeout(onSwipeRight, 280)
  }, [onSwipeRight])

  const triggerSwipeLeft = useCallback(() => {
    setDragX(-EXIT_X)
    setTimeout(onSwipeLeft, 280)
  }, [onSwipeLeft])

  const rotation = dragX * ROTATION_FACTOR
  const saveOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1)
  const skipOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1)

  const stackOffsetY = stackIndex * 10
  const stackScale = 1 - stackIndex * 0.045

  const deadline = item.deadline ? new Date(item.deadline) : null
  const displaySummary = item.aiSummary?.plainSummary || item.summary
  const contactUrl = item.officialActionUrl || item.sourceUrl

  return (
    <div
      ref={cardRef}
      className={cn(
        'absolute inset-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card',
        isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      )}
      style={{
        transform: isTop
          ? `translateX(${dragX}px) rotate(${rotation}deg)`
          : `translateY(${stackOffsetY}px) scale(${stackScale})`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 10 - stackIndex,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Save indicator overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-start rounded-2xl p-6"
        style={{ opacity: saveOpacity }}
      >
        <div
          className="rounded-xl border-4 border-green-500 px-4 py-2"
          style={{ transform: 'rotate(-14deg)' }}
        >
          <span className="text-2xl font-bold uppercase tracking-widest text-green-500">Save</span>
        </div>
      </div>

      {/* Skip indicator overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-start justify-end rounded-2xl p-6"
        style={{ opacity: skipOpacity }}
      >
        <div
          className="rounded-xl border-4 border-slate-400 px-4 py-2"
          style={{ transform: 'rotate(14deg)' }}
        >
          <span className="text-2xl font-bold uppercase tracking-widest text-slate-400">Skip</span>
        </div>
      </div>

      {/* Card body */}
      <div className="flex h-full flex-col p-6 select-none">
        {/* Category + meta badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {item.categories[0] && <CategoryBadge category={item.categories[0]} size="sm" />}
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {item.jurisdictionTags[0] || item.jurisdictionLevel}
          </span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {item.type.replace(/_/g, ' ')}
          </span>
          {item.isVerified && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          className="mb-3 text-2xl font-bold leading-tight text-slate-900"
          style={{ fontFamily: 'var(--font-serif, serif)' }}
        >
          {item.title}
        </h2>

        {/* Summary */}
        <p className="mb-4 line-clamp-5 flex-1 text-sm leading-relaxed text-slate-600">
          {displaySummary}
        </p>

        {/* Who's affected callout */}
        {item.aiSummary?.whoAffected && (
          <div className="mb-4 rounded-lg bg-orange-50 px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
              Who&rsquo;s affected
            </p>
            <p className="line-clamp-2 text-sm text-slate-700">{item.aiSummary.whoAffected}</p>
          </div>
        )}

        {/* Meta row */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {item.currentSupport > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {item.currentSupport.toLocaleString()} supporters
            </span>
          )}
          {deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {deadline.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Action links */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/issues/${item.slug}`}
            className="btn btn-secondary flex-1 justify-center text-center text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            View article
          </Link>
          {contactUrl && (
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary flex items-center gap-1.5 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Source
            </a>
          )}
        </div>
      </div>

      {/* Swipe button controls (accessible, desktop-friendly) */}
      {isTop && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 px-6 pb-5 pt-2">
          <button
            type="button"
            aria-label="Skip"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-400 hover:text-slate-700"
            onClick={(e) => {
              e.stopPropagation()
              triggerSwipeLeft()
            }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Save"
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-green-400 bg-white text-green-500 shadow-sm transition-all hover:border-green-500 hover:text-green-600"
            onClick={(e) => {
              e.stopPropagation()
              triggerSwipeRight()
            }}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
