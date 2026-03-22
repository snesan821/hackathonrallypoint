import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick?: () => void; href?: string }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-surface-container-high p-4">
          <Icon className="h-8 w-8 text-on-surface-variant" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-on-surface">{title}</h3>
      {description && <p className="mb-6 max-w-md text-sm text-on-surface-variant">{description}</p>}
      {action && (
        <>
          {action.href ? (
            <a href={action.href} className="btn btn-primary">{action.label}</a>
          ) : (
            <button onClick={action.onClick} className="btn btn-primary">{action.label}</button>
          )}
        </>
      )}
    </div>
  )
}
