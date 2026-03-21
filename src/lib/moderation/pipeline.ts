import { checkToxicity } from '@/lib/ai/claude'
import { prisma } from '@/lib/db/prisma'
import { CommentStatus } from '@prisma/client'

/**
 * Sanitize HTML content
 * For MVP, we strip all HTML tags
 * In production, use sanitize-html package for more granular control
 */
export function sanitizeHtml(html: string): string {
  // Strip all HTML tags
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .trim()
}

/**
 * Validate comment text length
 */
export function validateCommentLength(text: string): {
  valid: boolean
  error?: string
} {
  const trimmed = text.trim()

  if (trimmed.length < 10) {
    return { valid: false, error: 'Comment must be at least 10 characters' }
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Comment must be less than 2000 characters' }
  }

  return { valid: true }
}

/**
 * Result from the moderation pipeline
 */
export interface ModerationResult {
  approved: boolean
  status: CommentStatus
  score: number
  flags: string[]
  suggestion?: string
}

/**
 * Main moderation pipeline
 *
 * Processes new comments through:
 * 1. HTML sanitization
 * 2. Length validation
 * 3. Toxicity check via Claude AI
 * 4. Decision logic based on score
 *
 * @param text - Raw comment text
 * @param userId - User ID for audit trail
 * @returns ModerationResult with decision
 */
export async function moderateComment(
  text: string,
  userId: string
): Promise<ModerationResult> {
  // Step 1: Sanitize HTML
  const sanitized = sanitizeHtml(text)

  // Step 2: Validate length
  const lengthValidation = validateCommentLength(sanitized)
  if (!lengthValidation.valid) {
    return {
      approved: false,
      status: 'HIDDEN',
      score: 1.0,
      flags: ['invalid-length'],
      suggestion: lengthValidation.error,
    }
  }

  // Step 3: Run Claude toxicity check
  const toxicityResult = await checkToxicity(sanitized)

  // Step 4: Decision logic based on toxicity score
  const score = toxicityResult.score
  const flags = toxicityResult.flags

  let status: CommentStatus
  let approved: boolean

  if (score < 0.3) {
    // Clean comment - auto approve
    status = 'VISIBLE'
    approved = true
  } else if (score >= 0.3 && score < 0.7) {
    // Mildly problematic but acceptable - approve with logging
    status = 'VISIBLE'
    approved = true
    // Log for potential review
    console.log('[Moderation] Borderline comment approved', {
      userId,
      score,
      flags,
    })
  } else if (score >= 0.7 && score < 0.9) {
    // Clearly violates guidelines - flag for review
    status = 'FLAGGED'
    approved = false
  } else {
    // Severe violation - hide immediately
    status = 'HIDDEN'
    approved = false
  }

  return {
    approved,
    status,
    score,
    flags,
    suggestion: toxicityResult.suggestion,
  }
}

/**
 * Create a moderation flag for a comment
 *
 * @param commentId - Comment to flag
 * @param userId - User who reported (system for auto-flags)
 * @param reason - Reason for flagging
 * @param details - Additional context
 * @param score - Toxicity score
 */
export async function createModerationFlag(
  commentId: string,
  userId: string,
  reason: string,
  details: string,
  score?: number
) {
  return prisma.moderationFlag.create({
    data: {
      commentId,
      reportedById: userId,
      reason: 'OTHER', // Map string to enum if needed
      details,
      status: 'PENDING',
    },
  })
}

/**
 * Auto-moderate a comment based on toxicity check
 * This is called when creating a new comment
 *
 * @param text - Comment text
 * @param userId - User ID
 * @param commentId - Created comment ID (if flagged)
 * @returns Moderation result
 */
export async function autoModerateComment(
  text: string,
  userId: string,
  commentId?: string
): Promise<ModerationResult> {
  const result = await moderateComment(text, userId)

  // If comment is flagged or hidden, create a moderation flag
  if ((result.status === 'FLAGGED' || result.status === 'HIDDEN') && commentId) {
    await createModerationFlag(
      commentId,
      userId, // System user for auto-flags
      'Automated toxicity detection',
      `Auto-flagged by moderation pipeline. Score: ${result.score.toFixed(2)}. Flags: ${result.flags.join(', ')}`,
      result.score
    )
  }

  return result
}

/**
 * Review a flagged comment (admin action)
 *
 * @param flagId - Moderation flag ID
 * @param reviewerId - Admin/moderator user ID
 * @param action - Action to take (DISMISS, HIDE, REMOVE)
 * @param reviewNotes - Admin notes
 */
export async function reviewFlag(
  flagId: string,
  reviewerId: string,
  action: 'DISMISS' | 'HIDE' | 'REMOVE',
  reviewNotes?: string
) {
  const flag = await prisma.moderationFlag.findUnique({
    where: { id: flagId },
    include: { comment: true },
  })

  if (!flag) {
    throw new Error('Moderation flag not found')
  }

  // Update flag status
  await prisma.moderationFlag.update({
    where: { id: flagId },
    data: {
      status: action === 'DISMISS' ? 'DISMISSED' : 'ACTIONED',
      reviewedById: reviewerId,
      reviewedAt: new Date(),
    },
  })

  // Apply action to comment
  if (action === 'HIDE') {
    await prisma.comment.update({
      where: { id: flag.commentId },
      data: { status: 'HIDDEN' },
    })
  } else if (action === 'REMOVE') {
    // For REMOVE, we actually delete the comment
    await prisma.comment.delete({
      where: { id: flag.commentId },
    })
  }
  // DISMISS does nothing to the comment

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: reviewerId,
      action: `MODERATION_${action}`,
      entityType: 'Comment',
      entityId: flag.commentId,
      metadata: {
        flagId,
        reviewNotes,
        originalStatus: flag.comment.status,
      },
    },
  })
}
