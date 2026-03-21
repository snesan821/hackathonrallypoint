'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { CategoryBadge } from '@/components/civic/CategoryBadge'
import { CivicItemCard } from '@/components/civic/CivicItemCard'
import { Edit2, MapPin, Calendar, TrendingUp, Save, X } from 'lucide-react'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { Category } from '@prisma/client'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [savedItems, setSavedItems] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState('')
  const [editInterests, setEditInterests] = useState<Category[]>([])
  const [editAddress, setEditAddress] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchSavedItems()
    fetchRecentActivity()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      const data = await res.json()

      if (data.success) {
        setProfile(data.data)
        setEditDisplayName(data.data.displayName)
        setEditInterests(data.data.interests)
        if (data.data.primaryAddress) {
          setEditAddress(`${data.data.primaryAddress.city}, ${data.data.primaryAddress.state}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSavedItems = async () => {
    try {
      const res = await fetch('/api/user/saved?pageSize=3')
      const data = await res.json()
      if (data.success) {
        setSavedItems(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch saved items:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const res = await fetch('/api/user/impact')
      const data = await res.json()
      if (data.success) {
        setRecentActivity(data.data.recentActivity?.slice(0, 10) || [])
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)

    try {
      // Update profile
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editDisplayName,
          interests: editInterests,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setProfile({ ...profile, displayName: editDisplayName, interests: editInterests })
        setIsEditing(false)
      } else {
        alert('Failed to update profile: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleInterest = (category: Category) => {
    if (editInterests.includes(category)) {
      setEditInterests(editInterests.filter((c) => c !== category))
    } else {
      setEditInterests([...editInterests, category])
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 rounded-xl bg-slate-200" />
          <div className="h-64 rounded-xl bg-slate-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <UserButton />
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="rounded border border-slate-300 px-3 py-1 text-2xl font-bold text-slate-900"
                />
              ) : (
                <h1 className="text-2xl font-bold text-slate-900">{profile?.displayName}</h1>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                {profile?.primaryAddress && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {profile.primaryAddress.city}, {profile.primaryAddress.state}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
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
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Interests</h3>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {CIVIC_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => toggleInterest(category.value)}
                  className={`rounded-lg border-2 p-3 text-left transition-all ${
                    editInterests.includes(category.value)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="mb-1 text-sm font-medium">{category.label}</div>
                  {editInterests.includes(category.value) && (
                    <div className="text-xs text-orange-600">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.interests?.map((interest: Category) => (
                <CategoryBadge key={interest} category={interest} size="sm" />
              ))}
              {profile?.interests?.length === 0 && (
                <p className="text-sm text-slate-500">No interests selected yet</p>
              )}
            </div>
          )}
        </div>

        {/* Privacy note */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-medium">Privacy Note</p>
          <p className="mt-1 text-blue-800">
            Your address is used to personalize your feed and is never shared publicly. Only
            your city and state are visible to others.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Stats & Activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Engagement Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Your Impact</h2>
              <Link
                href="/impact"
                className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                <TrendingUp className="h-4 w-4" />
                View Full Dashboard
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Viewed" value={profile?.stats?.issuesViewed || 0} />
              <StatCard label="Saved" value={profile?.stats?.issuesSaved || 0} />
              <StatCard label="Supported" value={profile?.stats?.issuesSupported || 0} />
              <StatCard label="Comments" value={profile?.stats?.commentsPosted || 0} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm">
                    {activity.action[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">
                      {getActionLabel(activity.action)}
                    </p>
                    <Link
                      href={`/issues/${activity.civicItem.slug}`}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      {activity.civicItem.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && (
                <p className="text-center text-sm text-slate-600">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Saved Items */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Saved Issues</h2>
              <Link
                href="/saved"
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {savedItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/issues/${item.slug}`}
                  className="block rounded-lg border border-slate-200 p-3 hover:border-orange-500"
                >
                  <h3 className="line-clamp-2 text-sm font-medium text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.categories[0] && CIVIC_CATEGORIES.find(c => c.value === item.categories[0])?.label}
                  </p>
                </Link>
              ))}

              {savedItems.length === 0 && (
                <p className="text-center text-sm text-slate-600">No saved items yet</p>
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
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-600">{label}</div>
    </div>
  )
}

function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    VIEW: 'Viewed',
    SAVE: 'Saved',
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
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
    }
  }

  return 'Just now'
}
