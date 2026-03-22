import { prisma } from '@/lib/db/prisma'
import {
  Category,
  CivicItemStatus,
  CivicItemType,
  EngagementAction,
  JurisdictionLevel,
  UserRole,
} from '@prisma/client'

export interface CivicItemDetail {
  id: string
  title: string
  slug: string
  categories: Category[]
  type: CivicItemType
  status: CivicItemStatus
  jurisdictionTags: string[]
  jurisdictionLevel: JurisdictionLevel
  summary: string
  fullDescription: string | null
  deadline: Date | null
  currentSupport: number
  targetSupport: number | null
  allowsOnlineSignature: boolean
  tags: string[]
  districtIds: unknown
  latitude: number | null
  longitude: number | null
  officialActionUrl: string | null
  isVerified: boolean
  aiSummary: {
    plainSummary: string
    whoAffected: string
    whatChanges: string
    whyItMatters: string
    argumentsFor: string[]
    argumentsAgainst: string[]
    importantDates: Array<{ date: string; description: string }>
    nextActions: string[]
    categories: string[]
    affectedJurisdictions: string[]
    generatedAt: Date
  } | null
  sourceUrl: string | null
  organizerUpdates: Array<{
    id: string
    title: string
    body: string
    isVerified: boolean
    createdAt: Date
    author: {
      id: string
      displayName: string
      avatarUrl: string | null
      role: UserRole
    }
  }>
  commentCount: number
  engagementCount: number
  userEngagement: {
    actions: EngagementAction[]
    hasSupported: boolean
    hasSaved: boolean
    hasCommented: boolean
    lastEngagement: number | null
  } | null
  createdAt: Date
  updatedAt: Date
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((entry): entry is string => typeof entry === 'string')
}

function toImportantDates(
  value: unknown
): Array<{ date: string; description: string }> {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((entry) => {
    if (
      entry &&
      typeof entry === 'object' &&
      'date' in entry &&
      'description' in entry &&
      typeof entry.date === 'string' &&
      typeof entry.description === 'string'
    ) {
      return [{ date: entry.date, description: entry.description }]
    }

    return []
  })
}

export async function getCivicItemDetail(
  slug: string,
  userId?: string
): Promise<CivicItemDetail | null> {
  const civicItem = await prisma.civicItem.findUnique({
    where: { slug },
    include: {
      aiSummary: true,
      sourceDocuments: {
        select: {
          id: true,
          sourceUrl: true,
          uploadedAt: true,
        },
      },
      organizerUpdates: {
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          comments: true,
          engagements: true,
        },
      },
    },
  })

  if (!civicItem) {
    return null
  }

  let userEngagement: CivicItemDetail['userEngagement'] = null

  if (userId) {
    const engagements = await prisma.engagementEvent.findMany({
      where: {
        userId,
        civicItemId: civicItem.id,
      },
      select: {
        action: true,
        timestamp: true,
      },
    })

    userEngagement = {
      actions: engagements.map((engagement) => engagement.action),
      hasSupported: engagements.some((engagement) => engagement.action === 'SUPPORT'),
      hasSaved: engagements.some((engagement) => engagement.action === 'SAVE'),
      hasCommented: engagements.some((engagement) => engagement.action === 'COMMENT'),
      lastEngagement:
        engagements.length > 0
          ? Math.max(...engagements.map((engagement) => engagement.timestamp.getTime()))
          : null,
    }
  }

  return {
    id: civicItem.id,
    title: civicItem.title,
    slug: civicItem.slug,
    categories: civicItem.categories,
    type: civicItem.type,
    status: civicItem.status,
    jurisdictionTags: civicItem.jurisdictionTags,
    jurisdictionLevel: civicItem.jurisdictionLevel,
    summary: civicItem.summary,
    fullDescription: civicItem.fullDescription,
    deadline: civicItem.deadline,
    currentSupport: civicItem.currentSupport,
    targetSupport: civicItem.targetSupport,
    allowsOnlineSignature: civicItem.allowsOnlineSignature,
    tags: civicItem.tags,
    districtIds: civicItem.districtIds,
    latitude: civicItem.latitude,
    longitude: civicItem.longitude,
    officialActionUrl: civicItem.officialActionUrl,
    isVerified: civicItem.isVerified,
    aiSummary: civicItem.aiSummary
      ? {
          plainSummary: civicItem.aiSummary.plainSummary,
          whoAffected: civicItem.aiSummary.whoAffected,
          whatChanges: civicItem.aiSummary.whatChanges,
          whyItMatters: civicItem.aiSummary.whyItMatters,
          argumentsFor: toStringArray(civicItem.aiSummary.argumentsFor),
          argumentsAgainst: toStringArray(civicItem.aiSummary.argumentsAgainst),
          importantDates: toImportantDates(civicItem.aiSummary.importantDates),
          nextActions: toStringArray(civicItem.aiSummary.nextActions),
          categories: civicItem.aiSummary.categories,
          affectedJurisdictions: civicItem.aiSummary.affectedJurisdictions,
          generatedAt: civicItem.aiSummary.generatedAt,
        }
      : null,
    sourceUrl: civicItem.sourceUrl || civicItem.sourceDocuments[0]?.sourceUrl || null,
    organizerUpdates: civicItem.organizerUpdates.map((update) => ({
      id: update.id,
      title: update.title,
      body: update.body,
      isVerified: update.isVerified,
      createdAt: update.createdAt,
      author: update.author,
    })),
    commentCount: civicItem._count.comments,
    engagementCount: civicItem._count.engagements,
    userEngagement,
    createdAt: civicItem.createdAt,
    updatedAt: civicItem.updatedAt,
  }
}
