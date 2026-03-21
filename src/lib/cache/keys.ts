/**
 * Centralized cache key generators
 * Ensures consistent cache key naming across the application
 */

/**
 * Civic Items
 */
export const civicItemKeys = {
  // Single item by slug
  bySlug: (slug: string) => `civic_item:${slug}`,

  // Feed/list queries (includes filters)
  feed: (params: {
    category?: string
    type?: string
    status?: string
    jurisdictionLevel?: string
    search?: string
    sort?: string
    page?: number
    pageSize?: number
  }) => {
    const sortedParams = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|')
    return `civic_items:feed:${sortedParams || 'default'}`
  },

  // Personalized feed for user
  personalizedFeed: (userId: string, page: number = 1) =>
    `civic_items:personalized:${userId}:page:${page}`,

  // Trending items
  trending: () => 'civic_items:trending',

  // Support count for an item
  supportCount: (itemId: string) => `civic_item:${itemId}:support_count`,

  // Comments count for an item
  commentsCount: (itemId: string) => `civic_item:${itemId}:comments_count`,
}

/**
 * Comments
 */
export const commentKeys = {
  // Comments for a civic item
  byCivicItem: (civicItemId: string, threadType?: string, sort?: string) =>
    `comments:item:${civicItemId}:${threadType || 'all'}:${sort || 'newest'}`,

  // Single comment
  byId: (commentId: string) => `comment:${commentId}`,

  // Comment count by thread type
  countByThread: (civicItemId: string, threadType: string) =>
    `comments:count:${civicItemId}:${threadType}`,
}

/**
 * User Data
 */
export const userKeys = {
  // User profile
  profile: (userId: string) => `user:${userId}:profile`,

  // User's saved items
  savedItems: (userId: string, page: number = 1) => `user:${userId}:saved:page:${page}`,

  // User's engagement stats
  stats: (userId: string) => `user:${userId}:stats`,

  // User's impact data
  impact: (userId: string) => `user:${userId}:impact`,

  // User's recent activity
  recentActivity: (userId: string) => `user:${userId}:activity`,

  // User's engagement with specific item
  itemEngagement: (userId: string, itemId: string) => `user:${userId}:engagement:${itemId}`,
}

/**
 * Geocoding
 */
export const geoKeys = {
  // Geocoded address
  geocode: (address: string) => `geocode:${address.toLowerCase().trim()}`,

  // District lookup by coordinates
  districts: (lat: number, lng: number) => `districts:${lat.toFixed(4)}:${lng.toFixed(4)}`,

  // District lookup by ZIP code
  districtsByZip: (zipCode: string) => `districts:zip:${zipCode}`,
}

/**
 * Moderation
 */
export const moderationKeys = {
  // Moderation queue
  queue: (status: string, page: number = 1) => `moderation:queue:${status}:page:${page}`,

  // User's moderation history
  userHistory: (userId: string) => `moderation:user:${userId}:history`,

  // Flag for specific comment
  commentFlag: (commentId: string) => `moderation:comment:${commentId}:flags`,
}

/**
 * Rate Limiting
 */
export const rateLimitKeys = {
  // General rate limit
  byAction: (userId: string, action: string) => `ratelimit:${action}:${userId}`,

  // Engagement rate limit
  engagement: (userId: string) => `ratelimit:engage:${userId}`,

  // Comment rate limit
  comment: (userId: string) => `ratelimit:comment:${userId}`,

  // API rate limit
  api: (userId: string, endpoint: string) => `ratelimit:api:${endpoint}:${userId}`,
}

/**
 * AI Summaries
 */
export const aiKeys = {
  // Summary for source document
  summary: (documentId: string) => `ai:summary:${documentId}`,

  // Toxicity check result
  toxicity: (contentHash: string) => `ai:toxicity:${contentHash}`,
}

/**
 * Analytics & Stats
 */
export const analyticsKeys = {
  // Daily active users
  dau: (date: string) => `analytics:dau:${date}`,

  // Item view count
  itemViews: (itemId: string, period: 'day' | 'week' | 'month') =>
    `analytics:views:${itemId}:${period}`,

  // Category distribution
  categoryStats: () => 'analytics:category_distribution',

  // Jurisdiction stats
  jurisdictionStats: (jurisdiction: string) => `analytics:jurisdiction:${jurisdiction}`,
}

/**
 * Helper: Generate cache key with version
 * Useful for cache busting when data structure changes
 */
export function versionedKey(key: string, version: number = 1): string {
  return `v${version}:${key}`
}

/**
 * Helper: Generate wildcard pattern for key deletion
 */
export function wildcardPattern(baseKey: string): string {
  return `${baseKey}*`
}
