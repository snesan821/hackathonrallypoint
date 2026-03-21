import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { reviewFlag } from '@/lib/moderation/pipeline'
import { requireRole } from '@/lib/auth/server'
import { getSearchParams, buildPaginatedResponse, errorResponse, successResponse } from '@/lib/api/middleware'

/**
 * GET /api/admin/moderation
 * Get moderation queue (flagged comments)
 */
export async function GET(req: Request) {
  try {
    const user = await requireRole(['MODERATOR', 'ADMIN'])

    const searchParams = getSearchParams(req)
    const status = searchParams.get('status') || 'PENDING'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    const totalCount = await prisma.moderationFlag.count({ where })

    const flags = await prisma.moderationFlag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        comment: {
          include: {
            author: {
              select: { id: true, displayName: true, avatarUrl: true, role: true },
            },
            civicItem: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
        reportedBy: {
          select: { id: true, displayName: true, role: true },
        },
        reviewedBy: {
          select: { id: true, displayName: true, role: true },
        },
      },
    })

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

    return NextResponse.json(buildPaginatedResponse(queueItems, { page, pageSize, totalCount }))
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return errorResponse(error.message, 403)
    }
    console.error('GET /api/admin/moderation error:', error)
    return errorResponse('Failed to fetch moderation queue')
  }
}

/**
 * POST /api/admin/moderation
 * Review a flagged comment
 */
export async function POST(req: Request) {
  try {
    const user = await requireRole(['MODERATOR', 'ADMIN'])
    const { flagId, action, reviewNotes } = await req.json()

    await reviewFlag(flagId, user.id, action, reviewNotes)

    return successResponse({ message: 'Flag reviewed successfully', action })
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return errorResponse(error.message, 403)
    }
    if (error.message?.includes('not found')) {
      return errorResponse('Moderation flag not found', 404)
    }
    console.error('POST /api/admin/moderation error:', error)
    return errorResponse('Failed to review flag')
  }
}
