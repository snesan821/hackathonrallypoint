import { formatDeadline, getDeadlineUrgency } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { Clock, XCircle } from 'lucide-react'

interface DeadlineChipProps {
  deadline: Date | null
  className?: string
  showIcon?: boolean
}

export function DeadlineChip({
  deadline,
  className,
  showIcon = true,
}: DeadlineChipProps) {
  if (!deadline) {
    return null
  }

  const urgency = getDeadlineUrgency(deadline)
  const formattedDeadline = formatDeadline(deadline)

  const urgencyStyles = {
    critical: 'bg-[var(--co-error)]/10 text-[var(--co-error)] border-[var(--co-error)]/20',
    high: 'bg-[var(--co-warning)]/10 text-[var(--co-warning)] border-[var(--co-warning)]/20',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-[var(--co-success)]/10 text-[var(--co-success)] border-[var(--co-success)]/20',
    ended: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  }

  const Icon = urgency === 'ended' ? XCircle : Clock

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm font-medium',
        urgencyStyles[urgency],
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{formattedDeadline}</span>
    </div>
  )
}
