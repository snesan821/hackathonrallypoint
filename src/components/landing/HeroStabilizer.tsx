'use client'

import { useState, type PointerEvent } from 'react'

type MotionState = {
  rotateX: number
  rotateY: number
  shiftX: number
  shiftY: number
}

const restingMotion: MotionState = {
  rotateX: 0,
  rotateY: 0,
  shiftX: 0,
  shiftY: 0,
}

export function HeroStabilizer() {
  const [motion, setMotion] = useState<MotionState>(restingMotion)

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height

    const offsetX = x - 0.5
    const offsetY = y - 0.5

    setMotion({
      rotateX: offsetY * -12,
      rotateY: offsetX * 14,
      shiftX: offsetX * 16,
      shiftY: offsetY * 16,
    })
  }

  const handlePointerLeave = () => {
    setMotion(restingMotion)
  }

  return (
    <div
      className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary/10 via-surface-container to-surface-container-high shadow-2xl overflow-hidden flex items-center justify-center [perspective:1200px]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className="relative flex size-[68%] max-h-[320px] max-w-[320px] items-center justify-center rounded-[2rem] border border-outline-variant/40 bg-surface-container-lowest/70 shadow-[0_24px_60px_rgba(28,27,27,0.12)] transition-transform duration-150 ease-out [transform-style:preserve-3d]"
        style={{
          transform: `translate3d(${motion.shiftX}px, ${motion.shiftY}px, 0) rotateX(${motion.rotateX}deg) rotateY(${motion.rotateY}deg)`,
        }}
      >
        <div className="absolute inset-4 rounded-[1.6rem] border border-outline-variant/35 bg-surface/55" />
        <div className="absolute inset-10 rounded-[1.2rem] border border-primary/25" />
        <div
          className="absolute h-16 w-16 rounded-2xl border border-primary/35 bg-primary/10 shadow-[0_0_0_1px_rgba(161,58,0,0.05)] transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${motion.shiftX * -0.45}px, ${motion.shiftY * -0.45}px, 24px)`,
          }}
        />
      </div>
    </div>
  )
}
