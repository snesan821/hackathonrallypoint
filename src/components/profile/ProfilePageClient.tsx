'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { CategoryBadge } from '@/components/civic/CategoryBadge'
import { Edit2, MapPin, Calendar, TrendingUp, Save, X } from 'lucide-react'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { Category } from '@prisma/client'
import type { ProfileData, RecentActivityItem, SavedItemPreview } from '@/lib/user/profile'

interface ProfilePageClientProps {
  initialProfile: ProfileData
  initialSavedItems: SavedItemPreview[]
  initialRecentActivity: RecentActivityItem[]
}

export function ProfilePageClient({
  initialProfile,
  initialSavedItems,
  initialRecentActivity,
}: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [savedItems] = useState(initialSavedItems)
  const [recentActivity] = useState(initialRecentActivity)
  const [isEditing, setIsEditing] = useState(false)
  const [editDisplayName, setEditDisplayName] = useState(initialProfile.displayName)
  const [editInterests, setEditInterests] = useState<Category[]>(initialProfile.interests)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: editDisplayName, interests: editInterests }),
      })
      const data = await res.json()
      if (data.success) {
        setProfile((prev) => ({
          ...prev,
          displayName: editDisplayName,
          interests: editInterests,
        }))
        setIsEditing(false)
      } else {
        alert(`Failed to update profile: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleInterest = (category: Category) => {
    setEditInterests((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="site-wrap py-8">
      <div className="mb-8 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <UserButton />
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="field max-w-xs text-2xl font-bold"
                />
              ) : (
                <h1 className="text-2xl font-bold text-on-surface">{profile.displayName}</h1>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                {profile.primaryAddress && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {profile.primaryAddress.city}, {profile.primaryAddress.state}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="btn btn-primary disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditDisplayName(profile.displayName)
                  setEditInterests(profile.interests)
                }}
                className="btn btn-secondary"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-on-surface-variant">Interests</h3>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {CIVIC_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => toggleInterest(category.value)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    editInterests.includes(category.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant bg-surface-container-lowest hover:border-outline'
                  }`}
                >
                  <div className="mb-1 text-sm font-medium text-on-surface">{category.label}</div>
                  {editInterests.includes(category.value) && (
                    <div className="text-xs text-primary">Selected</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <CategoryBadge key={interest} category={interest} size="sm" />
              ))}
              {profile.interests.length === 0 && (
                <p className="text-sm text-on-surface-variant">No interests selected yet</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
          <p className="font-medium text-on-surface">Privacy Note</p>
          <p className="mt-1">
            Your address is used to personalize your feed and is never shared publicly. Only your
            city and state are visible to others.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-on-surface-variant">
          <Link href="/privacy" className="hover:text-on-surface">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-on-surface">
            Terms & Conditions
          </Link>
          <Link href="/contact" className="hover:text-on-surface">
            Contact Us
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface font-headline">Your Impact</h2>
              <Link
                href="/impact"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-container"
              >
                <TrendingUp className="h-4 w-4" />
                View Full Dashboard
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Viewed" value={profile.stats.issuesViewed} />
              <StatCard label="Following" value={profile.stats.issuesSaved} />
              <StatCard label="Supported" value={profile.stats.issuesSupported} />
              <StatCard label="Comments" value={profile.stats.commentsPosted} />
            </div>
          </div>

          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <h2 className="mb-4 text-xl font-bold text-on-surface font-headline">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={`${activity.action}-${activity.timestamp.toString()}-${index}`}
                  className="flex items-start gap-3 border-b border-outline-variant/15 pb-3 last:border-0"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">
                    {activity.action[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-on-surface">{getActionLabel(activity.action)}</p>
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
                <p className="text-center text-sm text-on-surface-variant">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface font-headline">Following</h2>
              <Link
                href="/saved"
                className="text-sm font-medium text-primary hover:text-primary-container"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {savedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/issues/${item.slug}`}
                  className="block rounded-xl border border-outline-variant/15 p-3 hover:border-primary transition-colors"
                >
                  <h3 className="line-clamp-2 text-sm font-medium text-on-surface">{item.title}</h3>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {item.categories[0] &&
                      CIVIC_CATEGORIES.find((entry) => entry.value === item.categories[0])?.label}
                  </p>
                </Link>
              ))}
              {savedItems.length === 0 && (
                <p className="text-center text-sm text-on-surface-variant">Not following any issues yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-surface-container-low p-4">
      <div className="text-2xl font-bold text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant">{label}</div>
    </div>
  )
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    VIEW: 'Viewed',
    SAVE: 'Followed',
    SUPPORT: 'Supported',
    COMMENT: 'Commented on',
    SHARE: 'Shared',
    CONTACT_REP: 'Contacted rep about',
  }
  return labels[action] || action
}

function formatTimeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
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
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
  }
  return 'Just now'
}
