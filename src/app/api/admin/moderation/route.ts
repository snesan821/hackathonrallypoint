import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { reviewFlag } from '@/lib/moderation/pipeline'
import { withRole, getSearchParams, buildPaginatedResponse, errorResponse, successResponse } from '@/lib/api/middleware'
import { z } from 'zod'

/**
 * Validation schema for flag review
 */
const reviewFlagSchema = z.object({
  flagId: z.string().uuid(),
  action: z.enum(['DISMISS', 'HIDE', 'REMOVE']),
  reviewNotes: z.string().optional(),
})

/**
 * GET /api/admin/moderation
 * Get moderation queue (flagged comments)
 *
 * Requires MODERATOR or ADMIN role
 *
 * Query params:
 * - status: PENDING | REVIEWED | ACTIONED | DISMISSED
 * - page: Page number
 * - pageSize: Items per page
 */
const getHandler = async (req: Request, { user }: any) => {
  try {
    const searchParams = getSearchParams(req)
    const status = searchParams.get('status') || 'PENDING'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    // Build where clause
    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Get total count
    const totalCount = await prisma.moderationFlag.count({ where })

    // Fetch flags
    const flags = await prisma.moderationFlag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        comment: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                role: true,
              },
            },
            civicItem: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        reportedBy: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    })

    // Transform to moderation queue format
    const queueItems = flags.map((flag) => ({
      id: flag.id,
      status: flag.status,
      reason: flag.reason,
      details: flag.details,
      createdAt: flag.createdAt,
      reviewedAt: flag.reviewedAt,
      comment: {
        id: flag.comment.id,
        body: flag.comment.body,
        sanitizedBody: flag.comment.sanitizedBody,
        status: flag.comment.status,
        threadType: flag.comment.threadType,
        author: flag.comment.author,
        civicItem: flag.comment.civicItem,
        createdAt: flag.comment.createdAt,
      },
      reportedBy: flag.reportedBy,
      reviewedBy: flag.reviewedBy,
    }))

    const response = buildPaginatedResponse(queueItems, { page, pageSize, totalCount })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GET /api/admin/moderation error:', error)
    return errorResponse('Failed to fetch moderation queue')
  }
}

/**
 * POST /api/admin/moderation
 * Review a flagged comment
 *
 * Requires MODERATOR or ADMIN role
 */
const postHandler = async (req: Request, { user, body }: any) => {
  try {
    const { flagId, action, reviewNotes } = body

    // Review the flag
    await reviewFlag(flagId, user.id, action, reviewNotes)

    return successResponse({
      message: 'Flag reviewed successfully',
      action,
    })
  } catch (error: any) {
    console.error('POST /api/admin/moderation error:', error)

    if (error.message?.includes('not found')) {
      return errorResponse('Moderation flag not found', 404)
    }

    return errorResponse('Failed to review flag')
  }
}

// Apply middleware: require MODERATOR or ADMIN role
export const GET = withRole(['MODERATOR', 'ADMIN'])(getHandler)
export const POST = withRole(['MODERATOR', 'ADMIN'])(postHandler)
