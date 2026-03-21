'use client'

import { formatSupport } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface SupportBarProps {
  currentSupport: number
  targetSupport: number | null
  className?: string
  showText?: boolean
  animated?: boolean
}

export function SupportBar({
  currentSupport,
  targetSupport,
  className,
  showText = true,
  animated = true,
}: SupportBarProps) {
  if (!targetSupport) {
    return (
      <div className={cn('text-sm text-on-surface-variant', className)}>
        <span className="font-semibold">{currentSupport.toLocaleString()}</span> supporters
      </div>
    )
  }

  const percentage = Math.min(100, (currentSupport / targetSupport) * 100)
  const isComplete = currentSupport >= targetSupport
  const milestones = [25, 50, 75, 100]

  return (
    <div className={cn('space-y-2', className)}>
      <div className="progress-track relative">
        <div
          className={cn(
            'progress-fill',
            isComplete && 'bg-[var(--co-success)]',
            animated && 'animate-in slide-in-from-left'
          )}
          style={{ width: `${percentage}%` }}
        />
        {milestones.map((milestone) => {
          const isPassed = percentage >= milestone
          return (
            <div
              key={milestone}
              className="absolute top-0 bottom-0 w-0.5 bg-white/30"
              style={{ left: `${milestone}%` }}
            >
              {isPassed && milestone !== 100 && (
                <div className="absolute -top-1 -left-1.5 h-2 w-2 rounded-full bg-white" />
              )}
            </div>
          )
        })}
      </div>

      {showText && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <div className="flex items-center gap-1 text-[var(--co-success)]">
                <Check className="h-4 w-4" />
                <span className="font-medium">Goal reached!</span>
              </div>
            ) : (
              <span className="text-on-surface-variant">{formatSupport(currentSupport, targetSupport)}</span>
            )}
          </div>
          <span className="text-on-surface-variant">{percentage.toFixed(0)}%</span>
        </div>
      )}
    </div>
  )
}
