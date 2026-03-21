'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CategoryBadge } from '@/components/civic/CategoryBadge'
import {
  TrendingUp,
  Eye,
  Bookmark,
  Heart,
  MessageCircle,
  Flame,
  Calendar,
} from 'lucide-react'

export default function ImpactPage() {
  const [impact, setImpact] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await fetch('/api/user/impact')
        const data = await res.json()

        if (data.success) {
          setImpact(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch impact:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImpact()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Your Impact</h1>
        <p className="text-slate-600">
          Track your civic engagement and see how you're making a difference
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Issues Viewed"
          value={impact?.totals?.issuesViewed || 0}
          color="blue"
        />
        <StatCard
          icon={Bookmark}
          label="Issues Saved"
          value={impact?.totals?.issuesSaved || 0}
          color="orange"
        />
        <StatCard
          icon={Heart}
          label="Issues Supported"
          value={impact?.totals?.issuesSupported || 0}
          color="red"
        />
        <StatCard
          icon={MessageCircle}
          label="Comments Posted"
          value={impact?.totals?.commentsPosted || 0}
          color="green"
        />
      </div>

      {/* Streak */}
      {impact?.streak > 0 && (
        <div className="mb-8 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white">
              <Flame className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-900">
                {impact.streak} Day Streak!
              </h3>
              <p className="text-orange-800">
                You've been engaged {impact.streak} {impact.streak === 1 ? 'day' : 'days'} in a row
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Category Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Categories You're Engaged With
          </h2>
          <div className="space-y-3">
            {impact?.categoryDistribution?.map((cat: any) => (
              <div key={cat.category} className="flex items-center gap-3">
                <CategoryBadge category={cat.category} size="sm" />
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-orange-600"
                      style={{
                        width: `${(cat.count / impact.totals.actionsCompleted) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700">{cat.count}</span>
              </div>
            ))}

            {impact?.categoryDistribution?.length === 0 && (
              <p className="text-center text-slate-600">
                Start engaging with issues to see your distribution
              </p>
            )}
          </div>
        </div>

        {/* Action Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Action Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(impact?.actionBreakdown || {}).map(([action, count]: any) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {action.replace('_', ' ')}
                </span>
                <span className="text-lg font-bold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Recent Activity</h2>
        <div className="space-y-4">
          {impact?.recentActivity?.map((activity: any, i: number) => (
            <div key={i} className="flex items-start gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  {getActionLabel(activity.action)}
                </p>
                <Link
                  href={`/issues/${activity.civicItem.slug}`}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  {activity.civicItem.title}
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDistanceToNow(new Date(activity.timestamp))}
                </p>
              </div>
            </div>
          ))}

          {impact?.recentActivity?.length === 0 && (
            <div className="rounded-lg bg-slate-50 p-12 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-slate-400" />
              <p className="text-lg font-medium text-slate-600">No activity yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Start engaging with issues to track your impact
              </p>
              <Link
                href="/feed"
                className="mt-4 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Explore Issues
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: number
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
  }[color]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className={`mb-3 inline-flex rounded-lg p-3 ${colorClasses}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  )
}

function getActionIcon(action: string) {
  const icons: Record<string, any> = {
    VIEW: Eye,
    SAVE: Bookmark,
    SUPPORT: Heart,
    COMMENT: MessageCircle,
    SHARE: '↗',
  }
  const Icon = icons[action]
  return Icon ? typeof Icon === 'string' ? Icon : <Icon className="h-5 w-5" /> : '•'
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    VIEW: 'Viewed',
    SAVE: 'Saved',
    SUPPORT: 'Supported',
    COMMENT: 'Commented on',
    SHARE: 'Shared',
    CONTACT_REP: 'Contacted representative about',
    RSVP: 'RSVPed to',
    VOLUNTEER: 'Volunteered for',
    SIGN: 'Signed',
  }
  return labels[action] || action
}

function formatDistanceToNow(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'Just now'
}
