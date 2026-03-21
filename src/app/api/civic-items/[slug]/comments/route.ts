import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { autoModerateComment } from '@/lib/moderation/pipeline'
import { checkEngagementFraud } from '@/lib/moderation/fraud'
import { createAuditEntry, extractIP } from '@/lib/moderation/audit'
import { withAuth, withValidation, getSearchParams, buildPaginatedResponse, errorResponse, successResponse } from '@/lib/api/middleware'
import { requireAuth } from '@/lib/auth/server'
import { z } from 'zod'
import { ThreadType } from '@prisma/client'
import { MODERATION_MESSAGES } from '@/constants/civility'

/**
 * Validation schema for comment creation
 */
const createCommentSchema = z.object({
  body: z.string().min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment must be less than 2000 characters'),
  threadType: z.nativeEnum(ThreadType),
  parentId: z.string().uuid().optional(),
})

/**
 * GET /api/civic-items/[slug]/comments
 * Get comments for a civic item
 *
 * Query params:
 * - threadType: Filter by thread type
 * - sort: newest | helpful
 * - page: Page number
 * - pageSize: Items per page
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const searchParams = getSearchParams(req)

    // Find civic item
    const civicItem = await prisma.civicItem.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!civicItem) {
      return errorResponse('Civic item not found', 404)
    }

    // Extract filters
    const threadType = searchParams.get('threadType') as ThreadType | null
    const sort = searchParams.get('sort') || 'newest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))

    // Build where clause
    const where: any = {
      civicItemId: civicItem.id,
      parentId: null, // Only get top-level comments
      status: { not: 'HIDDEN' }, // Don't show hidden comments
    }

    if (threadType) {
      where.threadType = threadType
    }

    // Build order by
    let orderBy: any
    if (sort === 'helpful') {
      orderBy = [{ upvotes: 'desc' }, { createdAt: 'desc' }]
    } else {
      orderBy = { createdAt: 'desc' }
    }

    // Get total count
    const totalCount = await prisma.comment.count({ where })

    // Fetch comments
    const comments = await prisma.comment.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            role: true,
          },
        },
        replies: {
          where: { status: { not: 'HIDDEN' } },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { replies: true },
        },
      },
    })

    // Transform to thread format
    const threads = comments.map((comment) => ({
      id: comment.id,
      body: comment.sanitizedBody || comment.body,
      threadType: comment.threadType,
      author: comment.author,
      upvotes: comment.upvotes,
      status: comment.status,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replyCount: comment._count.replies,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        body: reply.sanitizedBody || reply.body,
        author: reply.author,
        upvotes: reply.upvotes,
        status: reply.status,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
    }))

    const response = buildPaginatedResponse(threads, { page, pageSize, totalCount })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GET /api/civic-items/[slug]/comments error:', error)
    return errorResponse('Failed to fetch comments')
  }
}

/**
 * POST /api/civic-items/[slug]/comments
 * Create a new comment on a civic item
 *
 * Requires authentication
 * Runs toxicity check - auto-flags if score > 0.7
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth()
    const { slug } = await params
    const rawBody = await req.json()
    const validation = createCommentSchema.safeParse(rawBody)
    if (!validation.success) {
      return errorResponse('Invalid request format', 400)
    }
    const { body: commentBody, threadType, parentId } = validation.data

    const civicItem = await prisma.civicItem.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!civicItem) {
      return errorResponse('Civic item not found', 404)
    }

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { civicItemId: true, parentId: true },
      })
      if (!parentComment) return errorResponse('Parent comment not found', 404)
      if (parentComment.civicItemId !== civicItem.id) return errorResponse('Parent comment belongs to different civic item', 400)
      if (parentComment.parentId) return errorResponse('Cannot reply to a reply. Maximum 2 levels of nesting.', 400)
    }

    const fraudDetected = await checkEngagementFraud(user.id, 'COMMENT', civicItem.id)
    if (fraudDetected) {
      return errorResponse('Your account has been flagged for suspicious activity.', 403)
    }

    const moderationResult = await autoModerateComment(commentBody, user.id)
    if (!moderationResult.approved) {
      return NextResponse.json({
        success: false,
        error: moderationResult.suggestion || MODERATION_MESSAGES.commentFlagged,
        moderationScore: moderationResult.score,
      })
    }

    const comment = await prisma.comment.create({
      data: {
        civicItemId: civicItem.id,
        authorId: user.id,
        body: commentBody,
        sanitizedBody: commentBody.trim(),
        threadType,
        parentId: parentId || null,
        status: moderationResult.status,
      },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true, role: true } },
      },
    })

    await prisma.engagementEvent.create({
      data: {
        userId: user.id,
        civicItemId: civicItem.id,
        action: 'COMMENT',
        metadata: { commentId: comment.id, threadType },
      },
    })

    const ip = extractIP(req)
    await createAuditEntry({
      userId: user.id,
      action: 'COMMENT_CREATED',
      entityType: 'Comment',
      entityId: comment.id,
      metadata: { civicItemId: civicItem.id, threadType, moderationStatus: moderationResult.status },
      ip,
    })

    if (moderationResult.status === 'FLAGGED') {
      return NextResponse.json({ success: true, data: { id: comment.id, status: 'flagged', message: MODERATION_MESSAGES.commentFlagged } })
    }
    if (moderationResult.status === 'HIDDEN') {
      return NextResponse.json({ success: true, data: { id: comment.id, status: 'hidden', message: MODERATION_MESSAGES.commentHidden } })
    }

    return successResponse({
      id: comment.id,
      body: comment.sanitizedBody || comment.body,
      threadType: comment.threadType,
      author: comment.author,
      upvotes: comment.upvotes,
      status: comment.status,
      createdAt: comment.createdAt,
      message: 'Comment posted successfully',
    })
  } catch (error: any) {
    console.error('POST /api/civic-items/[slug]/comments error:', error)
    return errorResponse('Failed to post comment')
  }
}
