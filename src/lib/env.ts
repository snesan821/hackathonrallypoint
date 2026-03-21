/**
 * Environment variable validation and type-safe access
 * Uses Zod to validate all required environment variables at startup
 */

import { z } from 'zod'

/**
 * Environment variable schema
 * Add all required and optional env vars here
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis connection string'),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),
  CLERK_WEBHOOK_SECRET: z.string().min(1, 'CLERK_WEBHOOK_SECRET is required for webhook security'),


  // Application URLs
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url('NEXT_PUBLIC_SITE_URL must be a valid URL')
    .default('http://localhost:3000'),

  // Security
  SECURITY_SALT: z
    .string()
    .min(32, 'SECURITY_SALT must be at least 32 characters for secure IP hashing')
    .optional(),

  // Rate Limiting (optional overrides)
  RATE_LIMIT_COMMENTS_PER_HOUR: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional()
    .default(10),
  RATE_LIMIT_ENGAGEMENTS_PER_MINUTE: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .optional()
    .default(30),

  // Geocoding API (optional, for production upgrade)
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  NOMINATIM_API_URL: z.string().url().optional(),

  // Analytics (optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // Feature Flags
  ENABLE_AI_SUMMARIES: z
    .string()
    .transform((val) => val === 'true')
    .default(true),
  ENABLE_MODERATION: z
    .string()
    .transform((val) => val === 'true')
    .default(true),
  ENABLE_FRAUD_DETECTION: z
    .string()
    .transform((val) => val === 'true')
    .default(true),

  // Development
  SKIP_ENV_VALIDATION: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
})

/**
 * Validated environment variables
 * Use this instead of process.env for type safety
 */
export type Env = z.infer<typeof envSchema>

/**
 * Parse and validate environment variables
 * Throws detailed error if validation fails
 */
function parseEnv(): Env {
  // Allow skipping validation in certain contexts (e.g., build time)
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.warn('⚠️  Environment validation skipped')
    return process.env as unknown as Env
  }

  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      console.error('')

      error.issues.forEach((err) => {
        const path = err.path.join('.')
        console.error(`  ${path}: ${err.message}`)
      })

      console.error('')
      console.error('Please check your .env file and ensure all required variables are set.')
      console.error('See .env.example for reference.')
      console.error('')

      throw new Error('Environment validation failed')
    }

    throw error
  }
}

/**
 * Validated environment variables
 * Access using: env.DATABASE_URL, env.CLERK_SECRET_KEY, etc.
 */
export const env = parseEnv()

/**
 * Helper: Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Helper: Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * Helper: Check if running in test
 */
export const isTest = env.NODE_ENV === 'test'

/**
 * Helper: Get database connection options
 */
export function getDatabaseConfig() {
  return {
    url: env.DATABASE_URL,
    // Add pooling and connection limits in production
    ...(isProduction && {
      pool: {
        min: 2,
        max: 10,
      },
    }),
  }
}

/**
 * Helper: Get Redis connection options
 */
export function getRedisConfig() {
  return {
    url: env.REDIS_URL,
    // Add connection options for production
    ...(isProduction && {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    }),
  }
}

/**
 * Helper: Get feature flags
 */
export function getFeatureFlags() {
  return {
    aiSummaries: env.ENABLE_AI_SUMMARIES,
    moderation: env.ENABLE_MODERATION,
    fraudDetection: env.ENABLE_FRAUD_DETECTION,
  }
}

/**
 * Helper: Get rate limit configuration
 */
export function getRateLimitConfig() {
  return {
    commentsPerHour: env.RATE_LIMIT_COMMENTS_PER_HOUR || 10,
    engagementsPerMinute: env.RATE_LIMIT_ENGAGEMENTS_PER_MINUTE || 30,
  }
}

/**
 * Startup validation
 * Call this in your app initialization to fail fast on misconfiguration
 */
export function validateEnvironment(): void {
  console.log('🔍 Validating environment variables...')

  try {
    parseEnv()
    console.log('✅ Environment validation passed')

    // Additional runtime checks
    if (isProduction) {
      if (!env.SECURITY_SALT) {
        console.warn(
          '⚠️  SECURITY_SALT not set in production. IP hashing will use default (less secure).'
        )
      }

      if (!env.NEXT_PUBLIC_SITE_URL.startsWith('https://')) {
        console.warn(
          '⚠️  NEXT_PUBLIC_SITE_URL should use HTTPS in production for security.'
        )
      }
    }
  } catch (error) {
    console.error('❌ Environment validation failed')
    throw error
  }
}
