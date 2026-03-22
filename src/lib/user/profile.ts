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
  const [userProfile, engagements, recentActivityRows, recentSavedEvents] = await Promise.all([
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
    prisma.engagementEvent.findMany({
      where: {
        userId,
        action: 'SAVE',
      },
      select: {
        civicItemId: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 3,
    }),
  ])

  if (!userProfile) {
    return null
  }

  const savedItems = recentSavedEvents.length
    ? await prisma.civicItem.findMany({
        where: {
          id: {
            in: recentSavedEvents.map((event) => event.civicItemId),
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
    recentSavedEvents.map((event, index) => [event.civicItemId, index])
  )

  savedItems.sort(
    (a, b) => (savedItemOrder.get(a.id) ?? 0) - (savedItemOrder.get(b.id) ?? 0)
  )

  const engagementStats = engagements.reduce((acc, current) => {
    acc[current.action.toLowerCase()] = current._count.action
    return acc
  }, {} as Record<string, number>)

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
        issuesSaved: engagementStats.save || 0,
        issuesSupported: engagementStats.support || 0,
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
