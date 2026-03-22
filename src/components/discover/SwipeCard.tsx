'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Home, GraduationCap, Bus, Shield, Heart, Briefcase,
  Leaf, Scale, Building2, DollarSign, MapPin, MoreHorizontal,
  Calendar, Users, CheckCircle2,
} from 'lucide-react'
import type { Category, CivicItemType, JurisdictionLevel } from '@prisma/client'

// --------------------------------------------------------------------------
// Shared types
// --------------------------------------------------------------------------

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

export interface SwipeCardHandle {
  triggerLeft: () => void
  triggerRight: () => void
}

// --------------------------------------------------------------------------
// Category visual identity
// --------------------------------------------------------------------------

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  HOUSING: Home,
  EDUCATION: GraduationCap,
  TRANSIT: Bus,
  PUBLIC_SAFETY: Shield,
  HEALTHCARE: Heart,
  JOBS: Briefcase,
  ENVIRONMENT: Leaf,
  CIVIL_RIGHTS: Scale,
  CITY_SERVICES: Building2,
  BUDGET: DollarSign,
  ZONING: MapPin,
  OTHER: MoreHorizontal,
}

export const CATEGORY_GRADIENT: Record<string, string> = {
  HOUSING:       'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  EDUCATION:     'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
  TRANSIT:       'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
  PUBLIC_SAFETY: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
  HEALTHCARE:    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  JOBS:          'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  ENVIRONMENT:   'linear-gradient(135deg, #10b981 0%, #065f46 100%)',
  CIVIL_RIGHTS:  'linear-gradient(135deg, #6366f1 0%, #3730a3 100%)',
  CITY_SERVICES: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
  BUDGET:        'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
  ZONING:        'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
  OTHER:         'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
}

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const SWIPE_THRESHOLD = 80
const ROTATION_FACTOR = 0.07
const EXIT_X = 660

// --------------------------------------------------------------------------
// SwipeCard
// --------------------------------------------------------------------------

interface SwipeCardProps {
  item: SwipeItem
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
  stackIndex: number
  /** Called on mount with imperative handles so parent can trigger swipes */
  onRegister?: (handle: SwipeCardHandle) => void
}

export function SwipeCard({
  item,
  onSwipeLeft,
  onSwipeRight,
  isTop,
  stackIndex,
  onRegister,
}: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const isDraggingRef = useRef(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const primaryCategory = item.categories[0] ?? item.category
  const CategoryIcon = CATEGORY_ICONS[primaryCategory] ?? MoreHorizontal
  const heroGradient = CATEGORY_GRADIENT[primaryCategory] ?? CATEGORY_GRADIENT.OTHER

  // Expose imperative handles to parent
  const triggerLeft = useCallback(() => {
    setDragX(-EXIT_X)
    setTimeout(onSwipeLeft, 280)
  }, [onSwipeLeft])

  const triggerRight = useCallback(() => {
    setDragX(EXIT_X)
    setTimeout(onSwipeRight, 280)
  }, [onSwipeRight])

  useEffect(() => {
    if (isTop && onRegister) {
      onRegister({ triggerLeft, triggerRight })
    }
  }, [isTop, onRegister, triggerLeft, triggerRight])

  // Pointer drag
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
    if (delta > SWIPE_THRESHOLD) triggerRight()
    else if (delta < -SWIPE_THRESHOLD) triggerLeft()
    else setDragX(0)
  }, [triggerLeft, triggerRight])

  const rotation = dragX * ROTATION_FACTOR
  const saveOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1)
  const skipOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1)
  const stackOffsetY = stackIndex * 10
  const stackScale = 1 - stackIndex * 0.045
  const deadline = item.deadline ? new Date(item.deadline) : null
  const displaySummary = item.aiSummary?.plainSummary || item.summary

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
      style={{
        transform: isTop
          ? `translateX(${dragX}px) rotate(${rotation}deg)`
          : `translateY(${stackOffsetY}px) scale(${stackScale})`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 10 - stackIndex,
        cursor: isTop ? 'grab' : 'default',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Direction overlays */}
      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-start justify-start p-5"
        style={{ opacity: saveOpacity }}
      >
        <div
          className="rounded-xl border-4 border-green-500 px-4 py-1.5"
          style={{ transform: 'rotate(-14deg)' }}
        >
          <span className="text-xl font-bold uppercase tracking-widest text-green-500">Save</span>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-start justify-end p-5"
        style={{ opacity: skipOpacity }}
      >
        <div
          className="rounded-xl border-4 border-slate-400 px-4 py-1.5"
          style={{ transform: 'rotate(14deg)' }}
        >
          <span className="text-xl font-bold uppercase tracking-widest text-slate-400">Skip</span>
        </div>
      </div>

      {/* Category hero band */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ height: 144, background: heroGradient }}
      >
        {/* Dot grid texture */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.12]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={`dots-${item.id}`}
              x="0" y="0" width="22" height="22"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="3" cy="3" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${item.id})`} />
        </svg>

        {/* Large decorative icon */}
        <CategoryIcon className="absolute -right-5 -top-5 h-36 w-36 text-white opacity-[0.09]" />

        {/* Hero content */}
        <div className="relative z-10 flex h-full select-none flex-col justify-between p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <CategoryIcon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                {primaryCategory.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-medium text-white">{item.type.replace(/_/g, ' ')}</p>
            </div>
            {item.isVerified && (
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
              <MapPin className="h-3 w-3" />
              {item.jurisdictionTags[0] || item.jurisdictionLevel}
            </span>
            {item.allowsOnlineSignature && (
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                Sign online
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="flex flex-1 select-none flex-col overflow-hidden p-5">
        <h2
          className="mb-3 line-clamp-2 text-xl font-bold leading-snug text-slate-900"
          style={{ fontFamily: 'var(--font-serif, serif)' }}
        >
          {item.title}
        </h2>

        <p className="mb-3 line-clamp-4 flex-1 text-sm leading-relaxed text-slate-600">
          {displaySummary}
        </p>

        {item.aiSummary?.whoAffected && (
          <div className="mb-3 rounded-lg bg-orange-50 px-4 py-2.5">
            <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-orange-700">
              Who&rsquo;s affected
            </p>
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">
              {item.aiSummary.whoAffected}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
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
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
