import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

function createRedisClient(): Redis {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        // Stop retrying after 3 attempts — Redis is optional in dev
        return null
      }
      return Math.min(times * 200, 2000)
    },
    lazyConnect: true,
    enableOfflineQueue: false,
  })

  let errorLogged = false

  client.on('error', (err) => {
    if (!errorLogged) {
      console.warn('Redis unavailable — caching disabled. Error:', (err as any).code || err.message)
      errorLogged = true
    }
  })

  client.on('connect', () => {
    console.log('Redis: Connected')
    errorLogged = false
  })

  // Try to connect but don't block if it fails
  client.connect().catch(() => {})

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
