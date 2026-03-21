import { NextResponse } from 'next/server'
import { getCurrentUser, requireAuth, requireRole, type UserRole } from '@/lib/auth/server'
import { redis } from '@/lib/cache/redis'
import { z, ZodSchema } from 'zod'
import type { User } from '@prisma/client'

/**
 * API Handler Types
 */
export type ApiHandler<T = any> = (
  req: Request,
  context?: { params?: any; user?: User }
) => Promise<NextResponse<T>>

export type AuthenticatedHandler<T = any> = (
  req: Request,
  context: { params?: any; user: User }
) => Promise<NextResponse<T>>

/**
 * Wraps a route handler with authentication check
 * If user is not authenticated, returns 401
 */
export function withAuth<T = any>(
  handler: AuthenticatedHandler<T>
): ApiHandler<T> {
  return async (req: Request, context?: { params?: any }): Promise<NextResponse<any>> => {
    try {
      const user = await requireAuth()
      return handler(req, { ...context, user })
    } catch (error: any) {
      if (error.message?.includes('redirect')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      throw error
    }
  }
}

/**
 * Wraps a route handler with role-based access control
 * If user doesn't have required role, returns 403
 */
export function withRole<T = any>(
  roles: UserRole[],
  handler: AuthenticatedHandler<T>
): ApiHandler<T> {
  return async (req: Request, context?: { params?: any }): Promise<NextResponse<any>> => {
    try {
      const user = await requireRole(roles)
      return handler(req, { ...context, user })
    } catch (error: any) {
      if (error.message?.includes('Unauthorized')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 403 }
        )
      }
      throw error
    }
  }
}

/**
 * Redis-based rate limiter middleware
 * Uses sliding window algorithm
 *
 * @param keyFn - Function to generate rate limit key (usually includes user ID)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export function withRateLimit<T = any>(
  keyFn: (req: Request, user?: User) => string,
  maxRequests: number,
  windowSeconds: number
) {
  return (handler: ApiHandler<T>): ApiHandler<T> => {
    return async (req: Request, context?: { params?: any; user?: User }): Promise<NextResponse<any>> => {
      try {
        // Generate rate limit key
        const key = `ratelimit:${keyFn(req, context?.user)}`
        const now = Date.now()
        const windowStart = now - windowSeconds * 1000

        // Use sorted set to track requests in window
        // Remove old entries outside the window
        await redis.zremrangebyscore(key, 0, windowStart)

        // Count current requests in window
        const requestCount = await redis.zcard(key)

        if (requestCount >= maxRequests) {
          // Get oldest request time to calculate retry-after
          const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES')
          const retryAfter = oldestRequest[1]
            ? Math.ceil((Number(oldestRequest[1]) + windowSeconds * 1000 - now) / 1000)
            : windowSeconds

          return NextResponse.json(
            {
              success: false,
              error: 'Rate limit exceeded',
              retryAfter,
            },
            {
              status: 429,
              headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
              },
            }
          )
        }

        // Add current request to window
        await redis.zadd(key, now, `${now}-${Math.random()}`)

        // Set expiration on key
        await redis.expire(key, windowSeconds)

        // Add rate limit headers
        const response = await handler(req, context)
        response.headers.set('X-RateLimit-Limit', maxRequests.toString())
        response.headers.set(
          'X-RateLimit-Remaining',
          (maxRequests - requestCount - 1).toString()
        )

        return response
      } catch (error) {
        // If Redis fails, allow the request through (fail open)
        console.error('Rate limit check failed:', error)
        return handler(req, context)
      }
    }
  }
}

/**
 * Validates request body with Zod schema
 * Returns 400 if validation fails
 */
export function withValidation<TInput = any, TOutput = any>(
  schema: ZodSchema<TInput>
) {
  return (
    handler: (
      req: Request,
      context: { params?: any; user?: User; body: TInput }
    ) => Promise<NextResponse<TOutput>>
  ): ApiHandler<TOutput> => {
    return async (req: Request, context?: { params?: any; user?: User }) => {
      try {
        const body = await req.json()
        const validation = schema.safeParse(body)

        if (!validation.success) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid request format',
              errors: validation.error.issues,
            },
            { status: 400 }
          ) as any
        }

        return handler(req, { ...context, body: validation.data })
      } catch (error: any) {
        if (error.name === 'SyntaxError') {
          return NextResponse.json(
            { success: false, error: 'Invalid JSON in request body' },
            { status: 400 }
          ) as any
        }
        throw error
      }
    }
  }
}

/**
 * Composes multiple middleware functions
 * Executes them in order from left to right
 */
export function compose<T = any>(...middlewares: Array<(handler: any) => any>) {
  return (handler: ApiHandler<T>): ApiHandler<T> => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    )
  }
}

/**
 * Helper to extract search params from URL
 */
export function getSearchParams(req: Request): URLSearchParams {
  const { searchParams } = new URL(req.url)
  return searchParams
}

/**
 * Helper to build paginated response
 */
export interface PaginationParams {
  page: number
  pageSize: number
  totalCount: number
}

export function buildPaginatedResponse<T>(
  data: T[],
  pagination: PaginationParams
) {
  const { page, pageSize, totalCount } = pagination
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasMore: page < totalPages,
    },
  }
}

/**
 * Standard error response helper
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

/**
 * Standard success response helper
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}
