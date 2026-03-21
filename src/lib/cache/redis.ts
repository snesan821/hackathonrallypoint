import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    reconnectOnError(err) {
      console.error('Redis connection error:', err)
      const targetErrors = ['READONLY', 'ECONNREFUSED']
      if (targetErrors.some((targetError) => err.message.includes(targetError))) {
        // Reconnect on these errors
        return true
      }
      return false
    },
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

redis.on('connect', () => {
  console.log('Redis: Connected')
})

redis.on('error', (err) => {
  console.error('Redis error:', err)
})

redis.on('ready', () => {
  console.log('Redis: Ready to accept commands')
})
