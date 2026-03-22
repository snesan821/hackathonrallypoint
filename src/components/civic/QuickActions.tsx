'use client'

import { useState } from 'react'
import { Plus, Share2, Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { EngagementAction } from '@prisma/client'

interface QuickActionsProps {
  civicItemId: string
  civicItemSlug: string
  currentSupport: number
  userActions?: EngagementAction[]
  onEngage?: (action: EngagementAction) => Promise<void>
  className?: string
}

export function QuickActions({
  civicItemId,
  civicItemSlug,
  currentSupport,
  userActions = [],
  onEngage,
  className,
}: QuickActionsProps) {
  const [optimisticActions, setOptimisticActions] = useState<Set<EngagementAction>>(new Set(userActions))
  const [optimisticSupport, setOptimisticSupport] = useState(currentSupport)
  const [isLoading, setIsLoading] = useState<EngagementAction | null>(null)

  const hasSupported = optimisticActions.has('SUPPORT')
  const hasFollowed = optimisticActions.has('SAVE')

  const handleAction = async (action: EngagementAction) => {
    if (!onEngage || isLoading) return
    setIsLoading(action)
    const newActions = new Set(optimisticActions)
    if (action === 'SUPPORT') {
      if (hasSupported) { newActions.delete('SUPPORT'); setOptimisticSupport((prev) => prev - 1) }
      else { newActions.add('SUPPORT'); setOptimisticSupport((prev) => prev + 1) }
    } else if (action === 'SAVE') {
      if (hasFollowed) newActions.delete('SAVE')
      else newActions.add('SAVE')
    }
    setOptimisticActions(newActions)
    try { await onEngage(action) }
    catch (error) { setOptimisticActions(new Set(userActions)); setOptimisticSupport(currentSupport); console.error('Engagement action failed:', error) }
    finally { setIsLoading(null) }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/issues/${civicItemSlug}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Check out this civic issue', url }) }
      catch { console.log('Share cancelled') }
    } else {
      try { await navigator.clipboard.writeText(url); alert('Link copied to clipboard!') }
      catch (error) { console.error('Failed to copy link:', error) }
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={() => handleAction('SAVE')}
        disabled={isLoading === 'SAVE'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
          'hover:scale-105 active:scale-95',
          hasFollowed
            ? 'bg-primary/10 text-primary hover:bg-primary/15'
            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant',
          isLoading === 'SAVE' && 'opacity-50 cursor-not-allowed'
        )}
        title={hasFollowed ? 'Unfollow' : 'Follow'}
      >
        <Plus className={cn('h-4 w-4', hasFollowed && 'text-primary')} />
        <span className="hidden sm:inline">{hasFollowed ? 'Following' : 'Follow'}</span>
      </button>

      <button
        onClick={handleShare}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-all',
          'hover:scale-105 hover:bg-surface-variant active:scale-95'
        )}
        title="Share"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>

      <button
        onClick={() => handleAction(hasSupported ? 'UNSUPPORT' : 'SUPPORT')}
        disabled={isLoading === 'SUPPORT'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
          'hover:scale-105 active:scale-95',
          hasSupported
            ? 'bg-primary text-on-primary hover:bg-primary-container'
            : 'bg-primary/10 text-primary hover:bg-primary/15',
          isLoading === 'SUPPORT' && 'opacity-50 cursor-not-allowed'
        )}
        title={hasSupported ? 'Unsupport' : 'Show support'}
      >
        <Heart className={cn('h-4 w-4', hasSupported && 'fill-current')} />
        <span className="font-semibold">{optimisticSupport.toLocaleString()}</span>
        <span className="hidden sm:inline">{hasSupported ? 'Supported' : 'Support'}</span>
      </button>
    </div>
  )
}
