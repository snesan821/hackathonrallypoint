'use client'

import { useState, type PointerEvent } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const RESTING_ROTATE_X = 4
const RESTING_ROTATE_Y = -10

export function HeroStabilizer() {
  const [isHovered, setIsHovered] = useState(false)

  const handlePointerEnter = () => setIsHovered(true)
  const handlePointerLeave = () => setIsHovered(false)

  return (
    <div
      className="relative flex w-full items-center justify-center [perspective:1200px]"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Soft glow behind card */}
      <div className="absolute -inset-4 rounded-[3rem] bg-primary/45 blur-3xl -z-10" />

      <div
        className="relative z-10 w-full max-w-sm bg-surface-container-lowest p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-outline-variant/10 transition-transform duration-500 ease-out [transform-style:preserve-3d]"
        style={{
          transform: isHovered
            ? 'rotateX(0deg) rotateY(0deg)'
            : `rotateX(${RESTING_ROTATE_X}deg) rotateY(${RESTING_ROTATE_Y}deg)`,
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
              Trending Issue
            </span>
            <span className="text-on-surface-variant text-[10px] font-medium">
              2.4k active
            </span>
          </div>
          <h3 className="text-on-surface text-2xl font-bold leading-tight font-headline">
            Rent Stabilization Ordinance
          </h3>
          <p className="text-on-surface-variant text-sm leading-normal">
            Discussion on proposed amendments to local housing stability and tenant protections.
          </p>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary w-3/4" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex -space-x-2">
              <div className="size-6 rounded-full border-2 border-surface bg-surface-container-high" />
              <div className="size-6 rounded-full border-2 border-surface bg-surface-container-highest" />
              <div className="size-6 rounded-full border-2 border-surface bg-outline" />
            </div>
            <Link
              href="/discover"
              className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary-container transition-colors"
            >
              View Discussion
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
