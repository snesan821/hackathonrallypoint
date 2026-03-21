/**
 * API request/response types for RallyPoint
 */

import type {
  Category,
  CivicItemType,
  JurisdictionLevel,
  CivicItemStatus,
} from '@prisma/client'

// ============================================================================
// GENERIC API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasMore: boolean
}

// ============================================================================
// FEED & DISCOVERY TYPES
// ============================================================================

/**
 * Feed query parameters
 */
export interface FeedFilters {
  category?: Category | Category[]
  type?: CivicItemType | CivicItemType[]
  jurisdiction?: string | string[]
  jurisdictionLevel?: JurisdictionLevel | JurisdictionLevel[]
  status?: CivicItemStatus | CivicItemStatus[]
  search?: string
  sort?: 'deadline' | 'newest' | 'trending' | 'support'
  page?: number
  pageSize?: number
}

/**
 * Feed response with items and metadata
 */
export interface FeedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasMore: boolean
  appliedFilters?: FeedFilters
}

// ============================================================================
// ENGAGEMENT API TYPES
// ============================================================================

/**
 * Engagement action request
 */
export interface EngageRequest {
  action: string
  metadata?: Record<string, unknown>
}

/**
 * Engagement response with updated state
 */
export interface EngageResponse {
  success: boolean
  newSupport?: number
  userEngagement: {
    hasViewed: boolean
    hasSaved: boolean
    hasSupported: boolean
    hasCommented: boolean
    actions: string[]
  }
}

// ============================================================================
// COMMENT API TYPES
// ============================================================================

/**
 * Create comment request
 */
export interface CreateCommentRequest {
  civicItemId: string
  parentId?: string
  threadType: 'QUESTION' | 'SUPPORT' | 'CONCERN' | 'EVIDENCE'
  body: string
}

/**
 * Comment list query parameters
 */
export interface CommentListParams {
  civicItemId: string
  threadType?: 'QUESTION' | 'SUPPORT' | 'CONCERN' | 'EVIDENCE' | 'ALL'
  sort?: 'newest' | 'helpful'
  page?: number
  pageSize?: number
}

// ============================================================================
// USER API TYPES
// ============================================================================

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  displayName?: string
  interests?: Category[]
}

/**
 * Onboarding completion request
 */
export interface CompleteOnboardingRequest {
  interests: Category[]
  address: string
  displayName?: string
}

/**
 * Address validation/creation request
 */
export interface AddAddressRequest {
  address: string
}

// ============================================================================
// ADMIN API TYPES
// ============================================================================

/**
 * Create/update civic item request (admin)
 */
export interface UpsertCivicItemRequest {
  title: string
  slug?: string
  category: Category
  type: CivicItemType
  status: CivicItemStatus
  jurisdiction: string
  jurisdictionLevel: JurisdictionLevel
  summary: string
  fullDescription?: string
  sourceUrl?: string
  deadline?: string
  effectiveDate?: string
  targetSupport?: number
  allowsOnlineSignature: boolean
  officialActionUrl?: string
  tags: string[]
  districtIds: string[]
  latitude?: number
  longitude?: number
}

/**
 * Moderation action request
 */
export interface ModerationActionRequest {
  commentId: string
  action: 'DISMISS' | 'HIDE' | 'REMOVE' | 'WARN_USER'
  reason?: string
}

/**
 * Trigger AI summarization request
 */
export interface TriggerSummarizationRequest {
  sourceDocumentId: string
}

// ============================================================================
// ANALYTICS & IMPACT TYPES
// ============================================================================

/**
 * Personal impact dashboard response
 */
export interface PersonalImpactResponse {
  stats: {
    issuesViewed: number
    issuesSaved: number
    actionsCompleted: number
    commentsPosted: number
    supportGiven: number
  }
  engagementStreak: number
  recentActivity: Array<{
    id: string
    action: string
    civicItemTitle: string
    civicItemSlug: string
    timestamp: string
  }>
  categoryBreakdown: Array<{
    category: Category
    count: number
  }>
  actionBreakdown: Array<{
    action: string
    count: number
  }>
}

/**
 * Community impact dashboard response
 */
export interface CommunityImpactResponse {
  totalEngagementsThisWeek: number
  newIssuesThisWeek: number
  activeUsers: number
  trendingIssues: Array<{
    id: string
    title: string
    slug: string
    category: Category
    engagementCount: number
  }>
  categoryEngagement: Array<{
    category: Category
    count: number
    percentage: number
  }>
  milestones: string[]
  activeDistricts: Array<{
    districtId: string
    districtName: string
    engagementCount: number
  }>
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Structured API error
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationErrorResponse {
  success: false
  error: string
  errors: ValidationError[]
}
