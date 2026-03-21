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
    // No target support - just show count
    return (
      <div className={cn('text-sm text-slate-600', className)}>
        <span className="font-semibold">{currentSupport.toLocaleString()}</span> supporters
      </div>
    )
  }

  const percentage = Math.min(100, (currentSupport / targetSupport) * 100)
  const isComplete = currentSupport >= targetSupport

  // Calculate milestone markers at 25%, 50%, 75%, 100%
  const milestones = [25, 50, 75, 100]

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isComplete
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-orange-500 to-orange-600',
            animated && 'animate-in slide-in-from-left'
          )}
          style={{ width: `${percentage}%` }}
        />

        {/* Milestone markers */}
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

      {/* Text display */}
      {showText && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isComplete && (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                <span className="font-medium">Goal reached!</span>
              </div>
            )}
            {!isComplete && (
              <span className="text-slate-700">
                {formatSupport(currentSupport, targetSupport)}
              </span>
            )}
          </div>
          <span className="text-slate-500">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  )
}
