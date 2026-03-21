# RallyPoint Caching Strategy

This document outlines the comprehensive caching strategy for RallyPoint, including Redis caching, Next.js caching, and cache invalidation patterns.

## Overview

RallyPoint uses a multi-layered caching approach:
- **Redis** for application-level caching of API responses and computed data
- **Next.js** built-in caching for static pages and ISR
- **Clerk** session caching for authentication
- **Browser** caching for static assets

## Cache Layers

### 1. Redis Application Cache

**Location**: `src/lib/cache/`

**Purpose**: Cache frequently accessed data to reduce database queries and API calls

**Key Modules**:
- `keys.ts` - Centralized cache key generators
- `invalidate.ts` - Cache invalidation helpers with TTL constants

**TTL Strategy**:
```typescript
VERY_SHORT: 60s    // Real-time data (engagement counts, support counts)
SHORT: 5min        // Feed queries, trending items
MEDIUM: 15min      // User profiles, saved items
LONG: 30min        // Civic item details, AI summaries
VERY_LONG: 1hr     // Static content, category lists
DAY: 24hr          // Daily stats, analytics
WEEK: 7 days       // Geocoding results, district lookups
```

### 2. What We Cache

#### Civic Items
- **Single item by slug** (30 min TTL)
  - Key: `civic_item:{slug}`
  - Invalidate on: Item update/delete

- **Feed queries** (5 min TTL)
  - Key: `civic_items:feed:{params}`
  - Invalidate on: New item, item update, trending recalc

- **Personalized feeds** (5 min TTL)
  - Key: `civic_items:personalized:{userId}:page:{page}`
  - Invalidate on: User interests change, new items added

- **Trending items** (5 min TTL)
  - Key: `civic_items:trending`
  - Invalidate on: Engagement velocity changes

- **Support counts** (1 min TTL)
  - Key: `civic_item:{itemId}:support_count`
  - Invalidate on: New support action

#### Comments
- **Comments by civic item** (5 min TTL)
  - Key: `comments:item:{civicItemId}:{threadType}:{sort}`
  - Invalidate on: New comment, comment moderation

- **Single comment** (30 min TTL)
  - Key: `comment:{commentId}`
  - Invalidate on: Comment update, moderation action

#### User Data
- **User profile** (15 min TTL)
  - Key: `user:{userId}:profile`
  - Invalidate on: Profile update

- **User stats** (5 min TTL)
  - Key: `user:{userId}:stats`
  - Invalidate on: Any engagement action

- **Saved items** (15 min TTL)
  - Key: `user:{userId}:saved:page:{page}`
  - Invalidate on: Save/unsave action

- **Recent activity** (5 min TTL)
  - Key: `user:{userId}:activity`
  - Invalidate on: Any engagement action

#### Geocoding
- **Address geocoding** (7 days TTL)
  - Key: `geocode:{normalized_address}`
  - Rarely invalidated (addresses don't change)

- **District lookups** (7 days TTL)
  - Key: `districts:{lat}:{lng}` or `districts:zip:{zipCode}`
  - Invalidated on district boundary changes (rare)

#### AI Results
- **Claude summaries** (30 min TTL)
  - Key: `ai:summary:{documentId}`
  - Invalidate on: Source document update, regeneration request

- **Toxicity checks** (1 hour TTL)
  - Key: `ai:toxicity:{contentHash}`
  - Rarely invalidated (deterministic for same content)

### 3. Cache Invalidation Patterns

#### Cascade Invalidation

When a civic item is updated:
```typescript
await invalidateCivicItem(itemId, slug)
// Invalidates:
// - civic_item:{slug}
// - civic_item:{itemId}:support_count
// - civic_item:{itemId}:comments_count
// - civic_items:feed:* (all feed variations)
// - civic_items:trending
// - civic_items:personalized:* (all user feeds)
```

When a user engages:
```typescript
await invalidateUserEngagement(userId, itemId)
// Invalidates:
// - user:{userId}:engagement:{itemId}
// - user:{userId}:stats
// - user:{userId}:impact
// - user:{userId}:activity
// - civic_item:{itemId}:support_count
```

When a comment is posted:
```typescript
await invalidateItemComments(civicItemId)
// Invalidates:
// - comments:item:{civicItemId}:* (all thread types and sorts)
// - comments:count:{civicItemId}:*
// - civic_item:{civicItemId}:comments_count
```

#### Selective Invalidation

Instead of invalidating all caches, we use targeted patterns:

```typescript
// Good: Invalidate only affected queries
await invalidatePattern(`civic_items:feed:category:EDUCATION:*`)

// Avoid: Nuclear option (only for emergencies)
await invalidateAll()
```

### 4. Rate Limiting with Redis

Uses sorted sets with sliding window algorithm:

```typescript
// Key structure
ratelimit:{action}:{userId}

// Example implementation
const key = `ratelimit:engage:${userId}`
const now = Date.now()
const windowStart = now - (windowSeconds * 1000)

// Remove old entries
await redis.zremrangebyscore(key, 0, windowStart)

// Count requests in window
const count = await redis.zcard(key)

if (count >= maxRequests) {
  throw new Error('Rate limit exceeded')
}

// Add new entry
await redis.zadd(key, now, `${now}-${Math.random()}`)
await redis.expire(key, windowSeconds)
```

### 5. Next.js Caching

#### Route Handlers (API Routes)

```typescript
// Opt out of caching for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Or use ISR with revalidation
export const revalidate = 300 // 5 minutes
```

#### Server Components

```typescript
// Fetch with revalidation
const data = await fetch(url, {
  next: { revalidate: 300 } // 5 minutes
})

// Or tag-based revalidation
const data = await fetch(url, {
  next: { tags: ['civic-items'] }
})

// Invalidate by tag
revalidateTag('civic-items')
```

#### Static Pages

```typescript
// Force static generation
export const dynamic = 'force-static'

// Opt out of static generation
export const dynamic = 'force-dynamic'
```

### 6. Cache Warming

Pre-populate caches for better performance:

```typescript
// On app startup or via cron job
async function warmCaches() {
  // Cache trending items
  const trending = await getTrendingItems()
  await setCache(civicItemKeys.trending(), trending, CACHE_TTL.SHORT)

  // Cache common feed queries
  const categories = ['EDUCATION', 'HOUSING', 'TRANSPORTATION']
  for (const category of categories) {
    const items = await getCivicItems({ category })
    const key = civicItemKeys.feed({ category })
    await setCache(key, items, CACHE_TTL.SHORT)
  }
}
```

### 7. Cache Monitoring

Track cache hit rates and performance:

```typescript
// Log cache hits/misses
const cached = await getCache(key)
if (cached) {
  console.log('Cache HIT:', key)
  return cached
}

console.log('Cache MISS:', key)
const data = await fetchFromDatabase()
await setCache(key, data, ttl)
return data
```

**Production TODO**:
- Set up Redis monitoring (redis-cli INFO stats)
- Track hit rate: `keyspace_hits / (keyspace_hits + keyspace_misses)`
- Alert on low hit rate (< 70%)
- Monitor memory usage and eviction

### 8. Best Practices

#### DO:
✅ Use centralized key generators from `cache/keys.ts`
✅ Set appropriate TTLs based on data volatility
✅ Invalidate related caches when data changes
✅ Use cache-aside pattern (check cache → miss → query DB → set cache)
✅ Handle cache failures gracefully (return fresh data on Redis error)
✅ Use Redis transactions for atomicity when needed

#### DON'T:
❌ Store sensitive data in cache without encryption
❌ Cache user-specific PII (use ephemeral keys with short TTL)
❌ Set TTL > 1 hour for frequently changing data
❌ Invalidate all caches when only specific data changed
❌ Rely solely on caching for critical data (always have DB fallback)
❌ Cache very large objects (> 1MB, consider compression)

### 9. Production Considerations

#### Redis Configuration

```bash
# redis.conf optimizations
maxmemory 2gb
maxmemory-policy allkeys-lru  # Evict least recently used
save ""                       # Disable RDB snapshots for cache
appendonly no                 # No persistence needed for cache
```

#### Monitoring

Set up alerts for:
- Redis connection failures
- Memory usage > 80%
- Hit rate < 70%
- Eviction rate > 1000/sec
- Slow commands (> 10ms)

#### Scaling

For high traffic:
- Use Redis Cluster for horizontal scaling
- Set up read replicas for cache reads
- Consider Redis Sentinel for high availability
- Implement cache sharding by key prefix

### 10. Cache Keys Reference

See `src/lib/cache/keys.ts` for complete list of key generators.

Common patterns:
```
civic_item:{slug}
civic_items:feed:{params}
user:{userId}:profile
comments:item:{civicItemId}:{threadType}
ratelimit:{action}:{userId}
geocode:{address}
ai:summary:{documentId}
```

### 11. Debugging Caches

```bash
# Connect to Redis
redis-cli

# List all keys
KEYS *

# Get specific key
GET civic_item:some-slug

# Check TTL
TTL civic_item:some-slug

# Delete key
DEL civic_item:some-slug

# Flush all (use with caution!)
FLUSHDB
```

## Summary

This caching strategy provides:
- ⚡ Fast response times (cached data served in < 5ms)
- 📉 Reduced database load (70%+ cache hit rate)
- 💰 Lower API costs (Claude calls cached)
- 🔄 Automatic invalidation on data changes
- 🎯 Targeted cache clearing (no nuclear invalidations)
- 📊 Observable and debuggable cache behavior
