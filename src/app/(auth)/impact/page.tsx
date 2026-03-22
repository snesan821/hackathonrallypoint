import { redirect } from 'next/navigation'
import { getCurrentUserCached } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { CategoryBadge } from '@/components/civic/CategoryBadge'
import {
  Eye,
  Bookmark,
  Heart,
  MessageCircle,
  Flame,
  Calendar,
} from 'lucide-react'

export default async function ImpactPage() {
  const user = await getCurrentUserCached()
  if (!user) redirect('/sign-in')

  const [
    engagementsByAction,
    ,
    recentActivity,
    engagementDates,
    commentCount,
    ,
    engagementsByCategory,
  ] = await Promise.all([
    prisma.engagementEvent.groupBy({
      by: ['action'],
      where: { userId: user.id },
      _count: { action: true },
    }),
    prisma.engagementEvent.findMany({
      where: { userId: user.id },
      distinct: ['civicItemId'],
      select: { civicItemId: true },
    }),
    prisma.engagementEvent.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: {
        civicItem: {
          select: { id: true, title: true, slug: true, type: true },
        },
      },
    }),
    prisma.$queryRaw<Array<{ date: Date }>>`
      SELECT DISTINCT DATE("createdAt") as date
      FROM "EngagementEvent"
      WHERE "userId" = ${user.id}::uuid
      ORDER BY date DESC
      LIMIT 365
    `,
    prisma.comment.count({ where: { authorId: user.id } }),
    prisma.comment.findMany({
      where: { authorId: user.id },
      distinct: ['civicItemId'],
      select: { civicItemId: true },
    }),
    prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT ci.category::text as category, COUNT(*) as count
      FROM "EngagementEvent" ee
      JOIN "CivicItem" ci ON ee."civicItemId" = ci.id
      WHERE ee."userId" = ${user.id}::uuid
      GROUP BY ci.category
      ORDER BY count DESC
    `,
  ])

  const actionCounts = engagementsByAction.reduce((acc, curr) => {
    acc[curr.action] = curr._count.action
    return acc
  }, {} as Record<string, number>)

  const categoryDistribution = engagementsByCategory.map((item) => ({
    category: item.category,
    count: Number(item.count),
  }))

  const actionsCompleted = Object.values(actionCounts).reduce((a, b) => a + b, 0)

  // Calculate streak
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < engagementDates.length; i++) {
    const date = new Date(engagementDates[i].date)
    date.setHours(0, 0, 0, 0)
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff === i) streak++
    else break
  }

  const totals = {
    issuesViewed: actionCounts['VIEW'] || 0,
    issuesSaved: actionCounts['SAVE'] || 0,
    issuesSupported: actionCounts['SUPPORT'] || 0,
    commentsPosted: commentCount,
  }

  return (
    <div className="site-wrap py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-on-surface font-headline">Your Impact</h1>
        <p className="text-on-surface-variant">
          Track your civic engagement and see how you&rsquo;re making a difference
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Eye} label="Issues Viewed" value={totals.issuesViewed} color="blue" />
        <StatCard icon={Bookmark} label="Issues Saved" value={totals.issuesSaved} color="orange" />
        <StatCard icon={Heart} label="Issues Supported" value={totals.issuesSupported} color="red" />
        <StatCard icon={MessageCircle} label="Comments Posted" value={totals.commentsPosted} color="green" />
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="mb-8 rounded-2xl border border-outline-variant/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary">
              <Flame className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface">{streak} Day Streak!</h3>
              <p className="text-on-surface-variant">
                You&rsquo;ve been engaged {streak} {streak === 1 ? 'day' : 'days'} in a row
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Category Distribution */}
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
          <h2 className="mb-4 text-xl font-bold text-on-surface font-headline">
            Categories You&rsquo;re Engaged With
          </h2>
          <div className="space-y-3">
            {categoryDistribution.map((cat) => (
              <div key={cat.category} className="flex items-center gap-3">
                <CategoryBadge category={cat.category as any} size="sm" />
                <div className="flex-1">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${actionsCompleted > 0 ? (cat.count / actionsCompleted) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-on-surface-variant">{cat.count}</span>
              </div>
            ))}
            {categoryDistribution.length === 0 && (
              <p className="text-center text-on-surface-variant">
                Start engaging with issues to see your distribution
              </p>
            )}
          </div>
        </div>

        {/* Action Breakdown */}
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
          <h2 className="mb-4 text-xl font-bold text-on-surface font-headline">Action Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(actionCounts).map(([action, count]) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface-variant">
                  {action.replace('_', ' ')}
                </span>
                <span className="text-lg font-bold text-on-surface">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
        <h2 className="mb-6 text-xl font-bold text-on-surface font-headline">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-start gap-4 border-b border-outline-variant/15 pb-4 last:border-0 last:pb-0">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ActionIcon action={activity.action} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-on-surface">{getActionLabel(activity.action)}</p>
                <Link
                  href={`/issues/${activity.civicItem.slug}`}
                  className="text-sm text-primary hover:text-primary-container"
                >
                  {activity.civicItem.title}
                </Link>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <div className="rounded-2xl bg-surface-container-low p-12 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-on-surface-variant" />
              <p className="text-lg font-medium text-on-surface-variant">No activity yet</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Start engaging with issues to track your impact
              </p>
              <Link href="/feed" className="btn btn-primary mt-4 inline-flex">
                Explore Issues
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-surface-container-high text-on-surface-variant',
    orange: 'bg-primary/10 text-primary',
    red: 'bg-[var(--co-error)]/10 text-[var(--co-error)]',
    green: 'bg-[var(--co-success)]/10 text-[var(--co-success)]',
  }
  return (
    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
      <div className={`mb-3 inline-flex rounded-xl p-3 ${colorClasses[color] || colorClasses.orange}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl font-bold text-on-surface">{value}</div>
      <div className="text-sm text-on-surface-variant">{label}</div>
    </div>
  )
}

function ActionIcon({ action }: { action: string }) {
  const icons: Record<string, any> = { VIEW: Eye, SAVE: Bookmark, SUPPORT: Heart, COMMENT: MessageCircle }
  const Icon = icons[action]
  return Icon ? <Icon className="h-5 w-5" /> : <span>•</span>
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    VIEW: 'Viewed', SAVE: 'Saved', SUPPORT: 'Supported', COMMENT: 'Commented on',
    SHARE: 'Shared', CONTACT_REP: 'Contacted representative about',
    RSVP: 'RSVPed to', VOLUNTEER: 'Volunteered for', SIGN: 'Signed',
  }
  return labels[action] || action
}

function formatTimeAgo(date: Date | string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 }
  for (const [unit, s] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / s)
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}
