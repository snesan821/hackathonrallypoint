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
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
    ended: 'bg-slate-100 text-slate-600 border-slate-200',
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
