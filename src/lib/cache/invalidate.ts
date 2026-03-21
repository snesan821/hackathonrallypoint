/**
 * Cache invalidation helpers
 * Provides utilities to invalidate related cache entries when data changes
 */

import { redis } from '@/lib/cache/redis'
import {
  civicItemKeys,
  commentKeys,
  userKeys,
  moderationKeys,
  wildcardPattern,
} from './keys'

/**
 * Invalidate all cache entries matching a pattern
 */
async function invalidatePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length === 0) return 0

    await redis.del(...keys)
    return keys.length
  } catch (error) {
    console.error('Failed to invalidate cache pattern:', pattern, error)
    return 0
  }
}

/**
 * Delete a single cache key
 */
async function invalidateKey(key: string): Promise<boolean> {
  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error('Failed to invalidate cache key:', key, error)
    return false
  }
}

/**
 * Invalidate all cache entries for a civic item
 * Call this when a civic item is created, updated, or deleted
 */
export async function invalidateCivicItem(itemId: string, slug: string): Promise<void> {
  await Promise.all([
    // Single item cache
    invalidateKey(civicItemKeys.bySlug(slug)),

    // Support count
    invalidateKey(civicItemKeys.supportCount(itemId)),

    // Comments count
    invalidateKey(civicItemKeys.commentsCount(itemId)),

    // All feed queries (since the item might appear in various filtered feeds)
    invalidatePattern(wildcardPattern('civic_items:feed:')),

    // Trending cache
    invalidateKey(civicItemKeys.trending()),

    // All personalized feeds (since recommendations might change)
    invalidatePattern(wildcardPattern('civic_items:personalized:')),
  ])
}

/**
 * Invalidate feed caches
 * Call this when global feed data needs to be refreshed
 */
export async function invalidateFeeds(): Promise<void> {
  await Promise.all([
    invalidatePattern(wildcardPattern('civic_items:feed:')),
    invalidatePattern(wildcardPattern('civic_items:personalized:')),
    invalidateKey(civicItemKeys.trending()),
  ])
}

/**
 * Invalidate all cache entries for comments on a civic item
 * Call this when a comment is created, updated, or deleted
 */
export async function invalidateItemComments(civicItemId: string): Promise<void> {
  await Promise.all([
    // All comment queries for this item
    invalidatePattern(wildcardPattern(`comments:item:${civicItemId}:`)),

    // Comment counts by thread type
    invalidatePattern(wildcardPattern(`comments:count:${civicItemId}:`)),

    // Update comments count on the item
    invalidateKey(civicItemKeys.commentsCount(civicItemId)),
  ])
}

/**
 * Invalidate a specific comment
 * Call this when a comment is moderated or updated
 */
export async function invalidateComment(commentId: string, civicItemId: string): Promise<void> {
  await Promise.all([
    // Single comment
    invalidateKey(commentKeys.byId(commentId)),

    // All comments for the civic item
    invalidateItemComments(civicItemId),
  ])
}

/**
 * Invalidate user-specific caches
 * Call this when user data is updated
 */
export async function invalidateUserData(userId: string): Promise<void> {
  await Promise.all([
    // Profile
    invalidateKey(userKeys.profile(userId)),

    // Stats
    invalidateKey(userKeys.stats(userId)),

    // Impact
    invalidateKey(userKeys.impact(userId)),

    // Recent activity
    invalidateKey(userKeys.recentActivity(userId)),

    // Saved items
    invalidatePattern(wildcardPattern(`user:${userId}:saved:`)),

    // Personalized feed
    invalidatePattern(wildcardPattern(`civic_items:personalized:${userId}:`)),
  ])
}

/**
 * Invalidate user's engagement cache for a specific item
 * Call this when user engages with an item
 */
export async function invalidateUserEngagement(userId: string, itemId: string): Promise<void> {
  await Promise.all([
    // User's engagement with this item
    invalidateKey(userKeys.itemEngagement(userId, itemId)),

    // User stats (engagement counts change)
    invalidateKey(userKeys.stats(userId)),

    // User impact data
    invalidateKey(userKeys.impact(userId)),

    // Recent activity
    invalidateKey(userKeys.recentActivity(userId)),

    // Support count on the item
    invalidateKey(civicItemKeys.supportCount(itemId)),
  ])
}

/**
 * Invalidate saved items cache
 * Call this when user saves/unsaves an item
 */
export async function invalidateSavedItems(userId: string): Promise<void> {
  await Promise.all([
    invalidatePattern(wildcardPattern(`user:${userId}:saved:`)),
    invalidateKey(userKeys.stats(userId)),
  ])
}

/**
 * Invalidate moderation queue
 * Call this when moderation actions are taken
 */
export async function invalidateModerationQueue(status?: string): Promise<void> {
  if (status) {
    await invalidatePattern(wildcardPattern(`moderation:queue:${status}:`))
  } else {
    await invalidatePattern(wildcardPattern('moderation:queue:'))
  }
}

/**
 * Invalidate all caches (use sparingly, e.g., after major data migrations)
 */
export async function invalidateAll(): Promise<void> {
  try {
    await redis.flushdb()
    console.log('All caches invalidated')
  } catch (error) {
    console.error('Failed to flush all caches:', error)
  }
}

/**
 * Helper: Invalidate multiple keys at once
 */
export async function invalidateKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return

  try {
    await redis.del(...keys)
  } catch (error) {
    console.error('Failed to invalidate keys:', keys, error)
  }
}

/**
 * Helper: Set cache with TTL
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to set cache:', key, error)
  }
}

/**
 * Helper: Get cache value
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Failed to get cache:', key, error)
    return null
  }
}

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  VERY_SHORT: 60, // 1 minute - real-time data
  SHORT: 300, // 5 minutes - frequently changing data
  MEDIUM: 900, // 15 minutes - moderate update frequency
  LONG: 1800, // 30 minutes - relatively stable data
  VERY_LONG: 3600, // 1 hour - rarely changing data
  DAY: 86400, // 24 hours - daily stats
  WEEK: 604800, // 7 days - historical data
} as const
