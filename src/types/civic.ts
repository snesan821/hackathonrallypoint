/**
 * TypeScript types for RallyPoint civic engagement features
 * These mirror Prisma models but are optimized for frontend use
 */

import type {
  Category,
  CivicItemType,
  CivicItemStatus,
  JurisdictionLevel,
  EngagementAction,
  ThreadType,
  CommentStatus,
  UserRole,
} from '@prisma/client'

// ============================================================================
// CIVIC ITEM TYPES
// ============================================================================

/**
 * Civic item card - minimal data for feed/list views
 */
export interface CivicItemCard {
  id: string
  title: string
  slug: string
  category: Category
  type: CivicItemType
  status: CivicItemStatus
  jurisdiction: string
  jurisdictionLevel: JurisdictionLevel
  summary: string
  deadline?: Date | string | null
  currentSupport: number
  targetSupport?: number | null
  allowsOnlineSignature: boolean
  tags: string[]
  districtIds: string[]
  latitude?: number | null
  longitude?: number | null
  createdAt?: Date | string
}

/**
 * Full civic item detail with related data
 */
export interface CivicItemDetail extends CivicItemCard {
  fullDescription?: string | null
  sourceUrl?: string | null
  officialActionUrl?: string | null
  effectiveDate?: Date | string | null
  isVerified: boolean
  organizerId?: string | null
  aiSummary?: AISummaryData | null
  organizerUpdates?: OrganizerUpdateData[]
}

/**
 * AI-generated summary data
 */
export interface AISummaryData {
  id: string
  plainSummary: string
  whoAffected: string
  whatChanges: string
  whyItMatters: string
  argumentsFor: string[]
  argumentsAgainst: string[]
  importantDates: ImportantDate[]
  nextActions: string[]
  disclaimer: string
  modelVersion: string
  generatedAt: Date | string
}

export interface ImportantDate {
  date: string
  description: string
}

// ============================================================================
// USER & PROFILE TYPES
// ============================================================================

/**
 * User profile data
 */
export interface UserProfile {
  id: string
  displayName: string
  avatarUrl?: string | null
  role: UserRole
  interests: Category[]
  primaryAddress?: {
    city?: string | null
    state?: string | null
    districtIds: string[]
  } | null
  onboardingCompleted: boolean
}

/**
 * User impact statistics
 */
export interface ImpactStats {
  issuesViewed: number
  issuesSaved: number
  actionsCompleted: number
  commentsPosted: number
  supportGiven: number
  engagementStreak?: number
  categoryBreakdown?: Record<Category, number>
  actionBreakdown?: Record<EngagementAction, number>
}

// ============================================================================
// ENGAGEMENT & ACTIVITY TYPES
// ============================================================================

/**
 * User engagement state for a civic item
 */
export interface UserEngagementState {
  hasViewed: boolean
  hasSaved: boolean
  hasSupported: boolean
  hasCommented: boolean
  actions: EngagementAction[]
}

/**
 * Activity timeline entry
 */
export interface ActivityEntry {
  id: string
  action: EngagementAction
  civicItemTitle: string
  civicItemSlug: string
  timestamp: Date | string
}

// ============================================================================
// COMMENT & DISCUSSION TYPES
// ============================================================================

/**
 * Comment with nested replies
 */
export interface CommentThread {
  id: string
  userId: string
  user: {
    displayName: string
    avatarUrl?: string | null
    role: UserRole
  }
  civicItemId: string
  parentId?: string | null
  threadType: ThreadType
  body: string
  sanitizedBody: string
  status: CommentStatus
  moderationScore?: number | null
  replies?: CommentThread[]
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * Organizer update
 */
export interface OrganizerUpdateData {
  id: string
  title: string
  body: string
  isVerified: boolean
  author: {
    displayName: string
    avatarUrl?: string | null
  }
  createdAt: Date | string
}

// ============================================================================
// COMMUNITY & ANALYTICS TYPES
// ============================================================================

/**
 * Community impact metrics
 */
export interface CommunityImpact {
  totalEngagementsThisWeek: number
  activeUsers: number
  trendingIssues: TrendingIssue[]
  categoryEngagement: CategoryEngagement[]
  milestones: string[]
  activeDistricts: DistrictActivity[]
}

export interface TrendingIssue {
  id: string
  title: string
  slug: string
  category: Category
  engagementVelocity: number
  currentSupport: number
}

export interface CategoryEngagement {
  category: Category
  count: number
  percentage: number
}

export interface DistrictActivity {
  districtId: string
  districtName: string
  engagementCount: number
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

/**
 * Feed filter options
 */
export interface FeedFilters {
  category?: Category[]
  type?: CivicItemType[]
  jurisdiction?: string[]
  jurisdictionLevel?: JurisdictionLevel[]
  status?: CivicItemStatus[]
  search?: string
  sort?: FeedSortOption
  page?: number
  pageSize?: number
  districtIds?: string[]
}

export type FeedSortOption =
  | 'deadline'
  | 'newest'
  | 'trending'
  | 'support'
  | 'relevance'

// ============================================================================
// ONBOARDING TYPES
// ============================================================================

export interface OnboardingData {
  interests: Category[]
  address: string
  displayName?: string
}

export interface AddressValidationResult {
  id: string
  normalizedAddress: string
  latitude: number
  longitude: number
  city?: string | null
  state?: string | null
  zip?: string | null
  districtIds: string[]
  confidence: number
}
