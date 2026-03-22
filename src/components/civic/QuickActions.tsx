'use client'

import { useState, useEffect, useMemo } from 'react'
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
  // Create a stable Set from userActions using useMemo to prevent infinite loops
  const userActionsSet = useMemo(() => new Set(userActions), [userActions.join(',')])
  
  const [optimisticActions, setOptimisticActions] = useState<Set<EngagementAction>>(userActionsSet)
  const [optimisticSupport, setOptimisticSupport] = useState(currentSupport)
  const [isLoading, setIsLoading] = useState<EngagementAction | null>(null)

  // Sync optimistic state with props when they change (from parent updates)
  useEffect(() => {
    setOptimisticActions(userActionsSet)
  }, [userActionsSet])

  useEffect(() => {
    setOptimisticSupport(currentSupport)
  }, [currentSupport])

  const hasSupported = optimisticActions.has('SUPPORT')
  const hasFollowed = optimisticActions.has('SAVE')

  const handleAction = async (action: EngagementAction) => {
    if (!onEngage || isLoading) return
    setIsLoading(action)
    
    const newActions = new Set(optimisticActions)
    
    if (action === 'SUPPORT') {
      if (hasSupported) {
        // User is unsupporting - use UNSUPPORT action
        newActions.delete('SUPPORT')
        setOptimisticSupport((prev) => prev - 1)
        try {
          await onEngage('UNSUPPORT' as EngagementAction)
        } catch (error) {
          // Rollback on error
          newActions.add('SUPPORT')
          setOptimisticSupport((prev) => prev + 1)
          console.error('Unsupport action failed:', error)
        }
      } else {
        // User is supporting
        newActions.add('SUPPORT')
        setOptimisticSupport((prev) => prev + 1)
        try {
          await onEngage('SUPPORT')
        } catch (error) {
          // Rollback on error
          newActions.delete('SUPPORT')
          setOptimisticSupport((prev) => prev - 1)
          console.error('Support action failed:', error)
        }
      }
    } else if (action === 'SAVE') {
      if (hasFollowed) {
        // User is unfollowing - use UNSAVE action
        newActions.delete('SAVE')
        try {
          await onEngage('UNSAVE' as EngagementAction)
        } catch (error) {
          // Rollback on error
          newActions.add('SAVE')
          console.error('Unfollow action failed:', error)
        }
      } else {
        // User is following
        newActions.add('SAVE')
        try {
          await onEngage('SAVE')
        } catch (error) {
          // Rollback on error
          newActions.delete('SAVE')
          console.error('Follow action failed:', error)
        }
      }
    }
    
    setOptimisticActions(newActions)
    setIsLoading(null)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/issues/${civicItemSlug}`
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try { 
        await navigator.share({ title: 'Check out this civic issue', url }) 
      }
      catch { 
        console.log('Share cancelled') 
      }
      return
    }
    
    // Fallback to clipboard API (desktop)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { 
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!') 
      }
      catch (error) { 
        console.error('Failed to copy link:', error)
        fallbackCopyToClipboard(url)
      }
      return
    }
    
    // Final fallback for older browsers or insecure contexts
    fallbackCopyToClipboard(url)
  }

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      alert('Link copied to clipboard!')
    } catch (error) {
      console.error('Fallback copy failed:', error)
      alert('Could not copy link. Please copy manually: ' + text)
    }
    document.body.removeChild(textArea)
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
        disabled={isLoading === 'SUPPORT' || isLoading === 'UNSUPPORT'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-in-out select-none [-webkit-tap-highlight-color:transparent]',
          'hover:scale-105 active:scale-95',
          hasSupported
            ? 'bg-primary text-on-primary hover:bg-primary-container'
            : 'bg-primary/10 text-primary hover:bg-primary/15',
          (isLoading === 'SUPPORT' || isLoading === 'UNSUPPORT') && 'opacity-50 cursor-not-allowed'
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
