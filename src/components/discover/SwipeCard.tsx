'use client'

import { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { ExternalLink, Calendar, Users, MapPin, ArrowRight, Flame, CheckCircle2 } from 'lucide-react'
import { getCategoryMeta, getCivicTypeMeta } from '@/constants/categories'
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

export interface SwipeCardHandle {
  triggerSwipeLeft: () => void
  triggerSwipeRight: () => void
}

const SWIPE_THRESHOLD = 80
const ROTATION_FACTOR = 0.05
const EXIT_X = 700

// Full gradient + hero config per category
const CATEGORY_CONFIG: Record<string, {
  gradient: string
  gradientFrom: string
  emoji: string
  unsplashQuery: string
}> = {
  HOUSING:       { gradient: 'from-blue-700 via-blue-500 to-cyan-400',       gradientFrom: '#1d4ed8', emoji: '🏠', unsplashQuery: 'affordable-housing-neighborhood' },
  EDUCATION:     { gradient: 'from-violet-700 via-purple-500 to-fuchsia-400', gradientFrom: '#6d28d9', emoji: '🎓', unsplashQuery: 'university-campus-students' },
  TRANSIT:       { gradient: 'from-emerald-700 via-green-500 to-teal-400',   gradientFrom: '#065f46', emoji: '🚌', unsplashQuery: 'public-transit-bus-city' },
  PUBLIC_SAFETY: { gradient: 'from-red-700 via-rose-500 to-orange-400',      gradientFrom: '#b91c1c', emoji: '🛡️', unsplashQuery: 'community-safety-police' },
  HEALTHCARE:    { gradient: 'from-pink-700 via-rose-500 to-pink-400',       gradientFrom: '#be185d', emoji: '🏥', unsplashQuery: 'healthcare-hospital-community' },
  JOBS:          { gradient: 'from-amber-600 via-orange-500 to-yellow-400',  gradientFrom: '#d97706', emoji: '💼', unsplashQuery: 'jobs-economy-workers' },
  ENVIRONMENT:   { gradient: 'from-green-700 via-emerald-500 to-lime-400',   gradientFrom: '#15803d', emoji: '🌿', unsplashQuery: 'environment-nature-sustainability' },
  CIVIL_RIGHTS:  { gradient: 'from-indigo-700 via-blue-500 to-violet-400',   gradientFrom: '#3730a3', emoji: '✊', unsplashQuery: 'civil-rights-protest-community' },
  CITY_SERVICES: { gradient: 'from-sky-700 via-cyan-500 to-blue-400',        gradientFrom: '#0369a1', emoji: '🏛️', unsplashQuery: 'city-hall-government-building' },
  BUDGET:        { gradient: 'from-yellow-600 via-amber-500 to-orange-400',  gradientFrom: '#ca8a04', emoji: '💰', unsplashQuery: 'city-budget-finance' },
  ZONING:        { gradient: 'from-orange-700 via-amber-500 to-yellow-400',  gradientFrom: '#c2410c', emoji: '📐', unsplashQuery: 'urban-planning-zoning-development' },
  OTHER:         { gradient: 'from-slate-700 via-gray-500 to-zinc-400',      gradientFrom: '#334155', emoji: '📋', unsplashQuery: 'civic-community-meeting' },
}

// Unsplash source URLs — free, no API key needed
function getHeroImageUrl(query: string, id: string): string {
  // Use a seeded random based on item id so the same card always gets the same image
  const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  const w = 600
  const h = 280
  return `https://source.unsplash.com/featured/${w}x${h}/?${encodeURIComponent(query)}&sig=${seed}`
}

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(function SwipeCard(
  { item, onSwipeLeft, onSwipeRight, isTop, stackIndex },
  ref
) {
  const cardRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const isDraggingRef = useRef(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isTop) return
    // Don't start drag if the user clicked a button or link
    const target = e.target as HTMLElement
    if (target.closest('a, button')) return
    isDraggingRef.current = true
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
    setIsDragging(true)
    cardRef.current?.setPointerCapture(e.pointerId)
  }, [isTop])

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
      setIsExiting(true); setDragX(EXIT_X); setTimeout(onSwipeRight, 420)
    } else if (delta < -SWIPE_THRESHOLD) {
      setIsExiting(true); setDragX(-EXIT_X); setTimeout(onSwipeLeft, 420)
    } else {
      setDragX(0)
    }
  }, [onSwipeLeft, onSwipeRight])

  const triggerSwipeRight = useCallback(() => {
    if (isExiting) return
    setIsExiting(true); setDragX(EXIT_X); setTimeout(onSwipeRight, 420)
  }, [onSwipeRight, isExiting])

  const triggerSwipeLeft = useCallback(() => {
    if (isExiting) return
    setIsExiting(true); setDragX(-EXIT_X); setTimeout(onSwipeLeft, 420)
  }, [onSwipeLeft, isExiting])

  useImperativeHandle(ref, () => ({ triggerSwipeLeft, triggerSwipeRight }), [triggerSwipeLeft, triggerSwipeRight])

  const rotation = dragX * ROTATION_FACTOR
  const saveOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1)
  const skipOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1)
  const stackOffsetY = stackIndex * 12
  const stackScale = 1 - stackIndex * 0.045

  const cat = item.categories[0] || item.category
  const catMeta = getCategoryMeta(cat)
  const typeMeta = getCivicTypeMeta(item.type)
  const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.OTHER
  const deadline = item.deadline ? new Date(item.deadline) : null
  const displaySummary = item.aiSummary?.plainSummary || item.summary
  const contactUrl = item.officialActionUrl || item.sourceUrl
  const heroUrl = getHeroImageUrl(config.unsplashQuery, item.id)

  const supportPct = item.targetSupport && item.targetSupport > 0
    ? Math.min(100, Math.round((item.currentSupport / item.targetSupport) * 100))
    : null

  return (
    <div
      ref={cardRef}
      className={cn(
        'absolute inset-0 flex flex-col overflow-hidden rounded-2xl shadow-2xl bg-white',
        isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      )}
      style={{
        transform: isTop
          ? `translateX(${dragX}px) rotate(${rotation}deg)`
          : `translateY(${stackOffsetY}px) scale(${stackScale})`,
        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 10 - stackIndex,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ── HERO IMAGE (top 42% of card) ── */}
      <div className={cn('relative flex-shrink-0 bg-gradient-to-br', config.gradient)} style={{ height: '42%' }}>
        {/* Unsplash photo — falls back to gradient+emoji if it fails */}
        {!imgError && (
          <img
            src={heroUrl}
            alt={catMeta.label}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
            onError={() => setImgError(true)}
          />
        )}
        {/* Gradient overlay so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Emoji fallback watermark (visible when image loads or as decoration) */}
        {imgError && (
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30 select-none">
            {config.emoji}
          </div>
        )}

        {/* Save / Skip stamp overlays */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-start p-4" style={{ opacity: saveOpacity }}>
          <div className="rounded-xl border-[3px] border-green-400 px-3 py-1" style={{ transform: 'rotate(-12deg)' }}>
            <span className="text-lg font-black uppercase tracking-widest text-green-400 drop-shadow">SAVE</span>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-end p-4" style={{ opacity: skipOpacity }}>
          <div className="rounded-xl border-[3px] border-white/70 px-3 py-1" style={{ transform: 'rotate(12deg)' }}>
            <span className="text-lg font-black uppercase tracking-widest text-white/80 drop-shadow">SKIP</span>
          </div>
        </div>

        {/* Bottom-left: category + type badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
            {config.emoji} {catMeta.label}
          </span>
          <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            {typeMeta.label}
          </span>
        </div>

        {/* Top-right: verified badge */}
        {item.isVerified && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </div>
        )}
      </div>

      {/* ── CONTENT (bottom 58%) ── */}
      <div className="flex flex-1 flex-col px-4 pt-3 pb-3 overflow-hidden">
        {/* Title */}
        <h2 className="mb-1 text-[15px] font-bold leading-snug text-gray-900 line-clamp-2">
          {item.title}
        </h2>

        {/* Location */}
        {item.jurisdictionTags[0] && (
          <div className="mb-2 flex items-center gap-1 text-[11px] text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{item.jurisdictionTags[0]}</span>
          </div>
        )}

        {/* Summary */}
        <p className="mb-2.5 text-[12px] leading-relaxed text-gray-500 line-clamp-3 select-none">
          {displaySummary}
        </p>

        {/* AI context pills */}
        {(item.aiSummary?.whoAffected || item.aiSummary?.whyItMatters) && (
          <div className="mb-2.5 flex flex-col gap-1.5">
            {item.aiSummary?.whoAffected && (
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Who's affected · </span>
                <span className="text-[11px] text-gray-600 line-clamp-1">{item.aiSummary.whoAffected}</span>
              </div>
            )}
            {item.aiSummary?.whyItMatters && (
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Why it matters · </span>
                <span className="text-[11px] text-gray-600 line-clamp-1">{item.aiSummary.whyItMatters}</span>
              </div>
            )}
          </div>
        )}

        {/* Support bar */}
        {supportPct !== null && (
          <div className="mb-2.5">
            <div className="mb-1 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-400" />
                {item.currentSupport.toLocaleString()} supporters
              </span>
              <span>{supportPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn('h-full rounded-full bg-gradient-to-r', config.gradient)}
                style={{ width: `${supportPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats row */}
        {supportPct === null && (item.currentSupport > 0 || deadline) && (
          <div className="mb-2.5 flex items-center gap-3 text-[11px] text-gray-400">
            {item.currentSupport > 0 && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />{item.currentSupport.toLocaleString()} supporters
              </span>
            )}
            {deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* CTA buttons */}
        <div className="flex gap-2 border-t border-gray-100 pt-2.5">
          <Link
            href={`/issues/${item.slug}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2.5 text-[12px] font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            View details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {contactUrl && (
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  )
})
