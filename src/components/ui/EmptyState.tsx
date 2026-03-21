import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <Icon className="h-8 w-8 text-slate-400" />
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>

      {description && (
        <p className="mb-6 max-w-md text-sm text-slate-600">{description}</p>
      )}

      {action && (
        <>
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  )
}
