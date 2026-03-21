import { Category } from '@prisma/client'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { cn } from '@/lib/utils/cn'

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function CategoryBadge({
  category,
  size = 'md',
  showIcon = true,
  className,
}: CategoryBadgeProps) {
  const categoryMeta = CIVIC_CATEGORIES.find((c) => c.value === category)

  if (!categoryMeta) {
    return null
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium text-white',
        categoryMeta.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && categoryMeta.icon && (
        <span className="text-current">{categoryMeta.icon}</span>
      )}
      <span>{categoryMeta.label}</span>
    </div>
  )
}

/**
 * Multiple category badges displayed as a horizontal list
 */
interface CategoryBadgeListProps {
  categories: Category[]
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function CategoryBadgeList({
  categories,
  max = 3,
  size = 'sm',
  showIcon = false,
  className,
}: CategoryBadgeListProps) {
  const displayCategories = categories.slice(0, max)
  const remainingCount = categories.length - max

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {displayCategories.map((category) => (
        <CategoryBadge
          key={category}
          category={category}
          size={size}
          showIcon={showIcon}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-on-surface-variant">+{remainingCount} more</span>
      )}
    </div>
  )
}
