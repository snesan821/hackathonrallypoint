import { prisma } from '@/lib/db/prisma'
import { Category } from '@prisma/client'

export interface ProfileData {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: string
  onboardingCompleted: boolean
  interests: Category[]
  primaryAddress: {
    id: string
    city: string | null
    state: string | null
    zip: string | null
    districtIds: unknown
    jurisdictionTags: string[]
  } | null
  stats: {
    issuesViewed: number
    issuesSaved: number
    issuesSupported: number
    commentsPosted: number
    actionsCompleted: number
  }
  createdAt: Date
}

export interface SavedItemPreview {
  id: string
  slug: string
  title: string
  categories: Category[]
}

export interface RecentActivityItem {
  action: string
  civicItem: {
    slug: string
    title: string
  }
  timestamp: Date
}

export interface ProfilePageData {
  profile: ProfileData
  savedItems: SavedItemPreview[]
  recentActivity: RecentActivityItem[]
}

export async function getProfilePageData(userId: string): Promise<ProfilePageData | null> {
  const [userProfile, engagements, recentActivityRows, saveUnsaveEvents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        interests: {
          select: {
            category: true,
          },
        },
        addresses: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            city: true,
            state: true,
            zip: true,
            districtIds: true,
            jurisdictionTags: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.engagementEvent.groupBy({
      by: ['action'],
      where: { userId },
      _count: { action: true },
    }),
    prisma.engagementEvent.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        civicItem: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    }),
    // Get all SAVE and UNSAVE events to determine currently saved items
    prisma.engagementEvent.findMany({
      where: {
        userId,
        action: { in: ['SAVE', 'UNSAVE'] },
      },
      select: {
        civicItemId: true,
        action: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    }),
  ])

  if (!userProfile) {
    return null
  }

  // Determine currently saved items from most recent SAVE/UNSAVE per item
  const latestSaveActionByItem = new Map<string, { action: string; timestamp: Date }>()
  for (const event of saveUnsaveEvents) {
    if (!latestSaveActionByItem.has(event.civicItemId)) {
      latestSaveActionByItem.set(event.civicItemId, {
        action: event.action,
        timestamp: event.timestamp,
      })
    }
  }

  // Filter to only items where most recent action is SAVE
  const currentlySavedItems = Array.from(latestSaveActionByItem.entries())
    .filter(([_, data]) => data.action === 'SAVE')
    .map(([civicItemId, data]) => ({ civicItemId, timestamp: data.timestamp }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 3)

  const savedItems = currentlySavedItems.length > 0
    ? await prisma.civicItem.findMany({
        where: {
          id: {
            in: currentlySavedItems.map((item) => item.civicItemId),
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          categories: true,
        },
      })
    : []

  const savedItemOrder = new Map(
    currentlySavedItems.map((item, index) => [item.civicItemId, index])
  )

  savedItems.sort(
    (a, b) => (savedItemOrder.get(a.id) ?? 0) - (savedItemOrder.get(b.id) ?? 0)
  )

  const engagementStats = engagements.reduce((acc, current) => {
    acc[current.action.toLowerCase()] = current._count.action
    return acc
  }, {} as Record<string, number>)

  // Calculate net saves (SAVE - UNSAVE) and net supports (SUPPORT - UNSUPPORT)
  const saveCount = engagementStats.save || 0
  const unsaveCount = engagementStats.unsave || 0
  const netSaves = Math.max(0, saveCount - unsaveCount)

  const supportCount = engagementStats.support || 0
  const unsupportCount = engagementStats.unsupport || 0
  const netSupports = Math.max(0, supportCount - unsupportCount)

  return {
    profile: {
      id: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.displayName,
      avatarUrl: userProfile.avatarUrl,
      role: userProfile.role,
      onboardingCompleted: userProfile.onboardingCompleted,
      interests: userProfile.interests.map((interest) => interest.category),
      primaryAddress: userProfile.addresses[0] || null,
      stats: {
        issuesViewed: engagementStats.view || 0,
        issuesSaved: netSaves,
        issuesSupported: netSupports,
        commentsPosted: userProfile._count.comments,
        actionsCompleted: Object.values(engagementStats).reduce((sum, count) => sum + count, 0),
      },
      createdAt: userProfile.createdAt,
    },
    savedItems,
    recentActivity: recentActivityRows.map((event) => ({
      action: event.action,
      civicItem: event.civicItem,
      timestamp: event.timestamp,
    })),
  }
}
