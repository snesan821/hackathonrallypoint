'use client'

import { useState } from 'react'
import { EngagementAction } from '@prisma/client'
import { cn } from '@/lib/utils/cn'
import {
  BookOpen,
  Bookmark,
  Share2,
  MessageCircle,
  Heart,
  Phone,
  Calendar,
  Users,
  FileSignature,
  ExternalLink,
  Check,
  Lock,
} from 'lucide-react'

interface ActionStep {
  action: EngagementAction | 'LEARN_MORE' | 'OFFICIAL_ACTION'
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  available: boolean
  requiresPrerequisite?: boolean
  externalUrl?: string
}

interface ActionLadderProps {
  civicItemId: string
  slug: string
  userActions: EngagementAction[]
  allowsOnlineSignature: boolean
  officialActionUrl?: string | null
  hasHearing?: boolean
  allowsVolunteer?: boolean
  onEngage?: (action: EngagementAction) => Promise<void>
  className?: string
}

export function ActionLadder({
  civicItemId,
  slug,
  userActions,
  allowsOnlineSignature,
  officialActionUrl,
  hasHearing = false,
  allowsVolunteer = false,
  onEngage,
  className,
}: ActionLadderProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const hasCompleted = (action: EngagementAction | string) => {
    if (action === 'LEARN_MORE') return userActions.includes('VIEW')
    if (action === 'OFFICIAL_ACTION') return false // Never mark external actions as completed
    return userActions.includes(action as EngagementAction)
  }

  // Define action ladder steps
  const steps: ActionStep[] = [
    {
      action: 'LEARN_MORE',
      icon: BookOpen,
      label: 'Learn More',
      description: 'Read the full summary and details',
      available: true,
    },
    {
      action: 'SAVE',
      icon: Bookmark,
      label: 'Save for Later',
      description: 'Bookmark this issue to review later',
      available: true,
    },
    {
      action: 'SHARE',
      icon: Share2,
      label: 'Share',
      description: 'Spread awareness with your network',
      available: true,
    },
    {
      action: 'COMMENT',
      icon: MessageCircle,
      label: 'Join Discussion',
      description: 'Share your thoughts and questions',
      available: true,
    },
    {
      action: 'SUPPORT',
      icon: Heart,
      label: 'Show Support',
      description: 'Add your voice to this issue',
      available: true,
    },
    {
      action: 'CONTACT_REP',
      icon: Phone,
      label: 'Contact Representative',
      description: 'Reach out to your elected officials',
      available: true,
    },
  ]

  // Conditional steps
  if (hasHearing) {
    steps.push({
      action: 'RSVP',
      icon: Calendar,
      label: 'RSVP to Meeting',
      description: 'Attend the public hearing',
      available: true,
    })
  }

  if (allowsVolunteer) {
    steps.push({
      action: 'VOLUNTEER',
      icon: Users,
      label: 'Volunteer',
      description: 'Help organize and mobilize',
      available: hasCompleted('SUPPORT'),
      requiresPrerequisite: true,
    })
  }

  if (allowsOnlineSignature) {
    steps.push({
      action: 'SIGN',
      icon: FileSignature,
      label: 'Sign Online',
      description: 'Add your official signature',
      available: hasCompleted('SUPPORT'),
      requiresPrerequisite: true,
    })
  } else if (officialActionUrl) {
    steps.push({
      action: 'OFFICIAL_ACTION',
      icon: ExternalLink,
      label: 'Take Official Action',
      description: 'Visit the official page to participate',
      available: true,
      externalUrl: officialActionUrl,
    })
  }

  const handleAction = async (step: ActionStep) => {
    if (!step.available || loadingAction) return

    // Handle special actions
    if (step.action === 'LEARN_MORE') {
      document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    if (step.action === 'OFFICIAL_ACTION' && step.externalUrl) {
      window.open(step.externalUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (step.action === 'SHARE') {
      const url = `${window.location.origin}/issues/${slug}`
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Check out this civic issue', url })
        } catch (e) {
          console.log('Share cancelled')
        }
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      }
      return
    }

    if (step.action === 'COMMENT') {
      document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // For engagement actions, call the onEngage handler
    if (onEngage && step.action !== 'LEARN_MORE' && step.action !== 'OFFICIAL_ACTION') {
      setLoadingAction(step.action)
      try {
        await onEngage(step.action as EngagementAction)
      } catch (error) {
        console.error('Action failed:', error)
      } finally {
        setLoadingAction(null)
      }
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Take Action</h3>
        <p className="text-sm text-slate-600">
          Follow the steps below to make your voice heard
        </p>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const Icon = step.icon
          const completed = hasCompleted(step.action)
          const isLoading = loadingAction === step.action

          return (
            <button
              key={step.action}
              onClick={() => handleAction(step)}
              disabled={!step.available || isLoading}
              className={cn(
                'group relative w-full rounded-lg border-2 p-4 text-left transition-all',
                'hover:shadow-md active:scale-[0.98]',
                completed
                  ? 'border-green-500 bg-green-50'
                  : step.available
                  ? 'border-slate-200 bg-white hover:border-orange-500'
                  : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60',
                isLoading && 'opacity-50 cursor-wait'
              )}
            >
              {/* Step number */}
              <div className="absolute -left-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {index + 1}
              </div>

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    'rounded-lg p-2',
                    completed
                      ? 'bg-green-500 text-white'
                      : step.available
                      ? 'bg-orange-100 text-orange-700 group-hover:bg-orange-500 group-hover:text-white'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {completed ? (
                    <Check className="h-5 w-5" />
                  ) : !step.available && step.requiresPrerequisite ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{step.label}</h4>
                    {completed && (
                      <span className="text-xs font-medium text-green-600">Completed</span>
                    )}
                    {!step.available && step.requiresPrerequisite && (
                      <span className="text-xs font-medium text-slate-500">
                        Complete previous steps first
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>

                {/* External link indicator */}
                {step.externalUrl && (
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 rounded-lg bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Your Progress</span>
          <span className="text-slate-600">
            {userActions.length} of {steps.length} completed
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
            style={{
              width: `${(userActions.length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
