'use client'

import { useState } from 'react'
import { Bookmark, Share2, Heart } from 'lucide-react'
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
  const [optimisticActions, setOptimisticActions] = useState<Set<EngagementAction>>(
    new Set(userActions)
  )
  const [optimisticSupport, setOptimisticSupport] = useState(currentSupport)
  const [isLoading, setIsLoading] = useState<EngagementAction | null>(null)

  const hasSupported = optimisticActions.has('SUPPORT')
  const hasSaved = optimisticActions.has('SAVE')

  const handleAction = async (action: EngagementAction) => {
    if (!onEngage || isLoading) return

    setIsLoading(action)

    // Optimistic update
    const newActions = new Set(optimisticActions)
    if (action === 'SUPPORT') {
      if (hasSupported) {
        newActions.delete('SUPPORT')
        setOptimisticSupport((prev) => prev - 1)
      } else {
        newActions.add('SUPPORT')
        setOptimisticSupport((prev) => prev + 1)
      }
    } else if (action === 'SAVE') {
      if (hasSaved) {
        newActions.delete('SAVE')
      } else {
        newActions.add('SAVE')
      }
    }
    setOptimisticActions(newActions)

    try {
      await onEngage(action)
    } catch (error) {
      // Revert on error
      setOptimisticActions(new Set(userActions))
      setOptimisticSupport(currentSupport)
      console.error('Engagement action failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/issues/${civicItemSlug}`

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this civic issue',
          url,
        })
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Save button */}
      <button
        onClick={() => handleAction('SAVE')}
        disabled={isLoading === 'SAVE'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
          'hover:scale-105 active:scale-95',
          hasSaved
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
          isLoading === 'SAVE' && 'opacity-50 cursor-not-allowed'
        )}
        title={hasSaved ? 'Unsave' : 'Save for later'}
      >
        <Bookmark
          className={cn('h-4 w-4', hasSaved && 'fill-current')}
        />
        <span className="hidden sm:inline">{hasSaved ? 'Saved' : 'Save'}</span>
      </button>

      {/* Share button */}
      <button
        onClick={handleShare}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-all',
          'hover:scale-105 hover:bg-slate-200 active:scale-95'
        )}
        title="Share"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* Support button */}
      <button
        onClick={() => handleAction(hasSupported ? 'UNSUPPORT' : 'SUPPORT')}
        disabled={isLoading === 'SUPPORT'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
          'hover:scale-105 active:scale-95',
          hasSupported
            ? 'bg-orange-600 text-white hover:bg-orange-700'
            : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
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
