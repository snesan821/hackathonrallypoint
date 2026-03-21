import { prisma } from '@/lib/db/prisma'
import crypto from 'crypto'

/**
 * Hash an IP address for privacy-preserving storage
 * Uses SHA-256 with a server-side salt
 *
 * @param ip - IP address to hash
 * @returns Hashed IP
 */
export function hashIP(ip: string): string {
  const salt = process.env.SECURITY_SALT || 'default-salt-change-in-production'
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
}

/**
 * Extract IP address from request headers
 * Checks common headers used by proxies/load balancers
 *
 * @param req - Request object
 * @returns IP address or null
 */
export function extractIP(req: Request): string | null {
  // Try various headers
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  const cfConnectingIP = req.headers.get('cf-connecting-ip') // Cloudflare

  if (forwardedFor) {
    // x-forwarded-for can be comma-separated
    return forwardedFor.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return null
}

/**
 * Create an audit log entry
 * Append-only log for compliance and security
 *
 * @param params - Audit log parameters
 */
export async function createAuditEntry(params: {
  userId?: string | null
  action: string
  entityType: string
  entityId: string
  metadata?: any
  ip?: string | null
}) {
  const ipHash = params.ip ? hashIP(params.ip) : null

  return prisma.auditLog.create({
    data: {
      userId: params.userId || undefined,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata || {},
      ipHash,
    },
  })
}

/**
 * Log a high-value engagement action
 * These are actions that require audit trails (SUPPORT, SIGN, VOLUNTEER, etc.)
 *
 * @param userId - User ID
 * @param action - Engagement action
 * @param civicItemId - Civic item ID
 * @param metadata - Additional metadata
 * @param ip - User IP address
 */
export async function logEngagementAction(
  userId: string,
  action: string,
  civicItemId: string,
  metadata?: any,
  ip?: string | null
) {
  return createAuditEntry({
    userId,
    action: `ENGAGEMENT_${action}`,
    entityType: 'CivicItem',
    entityId: civicItemId,
    metadata: {
      action,
      ...metadata,
    },
    ip,
  })
}

/**
 * Log comment creation
 *
 * @param userId - User ID
 * @param commentId - Comment ID
 * @param civicItemId - Civic item ID
 * @param metadata - Additional metadata (toxicity score, etc.)
 * @param ip - User IP address
 */
export async function logCommentCreation(
  userId: string,
  commentId: string,
  civicItemId: string,
  metadata?: any,
  ip?: string | null
) {
  return createAuditEntry({
    userId,
    action: 'COMMENT_CREATED',
    entityType: 'Comment',
    entityId: commentId,
    metadata: {
      civicItemId,
      ...metadata,
    },
    ip,
  })
}

/**
 * Log moderation action
 *
 * @param moderatorId - Moderator user ID
 * @param action - Moderation action
 * @param targetEntityType - Type of entity being moderated
 * @param targetEntityId - ID of entity being moderated
 * @param metadata - Additional context
 * @param ip - Moderator IP address
 */
export async function logModerationAction(
  moderatorId: string,
  action: string,
  targetEntityType: string,
  targetEntityId: string,
  metadata?: any,
  ip?: string | null
) {
  return createAuditEntry({
    userId: moderatorId,
    action: `MODERATION_${action}`,
    entityType: targetEntityType,
    entityId: targetEntityId,
    metadata,
    ip,
  })
}

/**
 * Get audit trail for a specific entity
 *
 * @param entityType - Type of entity
 * @param entityId - Entity ID
 * @param limit - Number of entries to return
 * @returns Array of audit log entries
 */
export async function getEntityAuditTrail(
  entityType: string,
  entityId: string,
  limit = 50
) {
  return prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

/**
 * Get audit trail for a specific user
 *
 * @param userId - User ID
 * @param limit - Number of entries to return
 * @returns Array of audit log entries
 */
export async function getUserAuditTrail(userId: string, limit = 100) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Search audit logs
 * For admin/compliance purposes
 *
 * @param filters - Search filters
 * @returns Paginated audit log entries
 */
export async function searchAuditLogs(filters: {
  userId?: string
  action?: string
  entityType?: string
  startDate?: Date
  endDate?: Date
  page?: number
  pageSize?: number
}) {
  const page = filters.page || 1
  const pageSize = filters.pageSize || 50

  const where: any = {}

  if (filters.userId) where.userId = filters.userId
  if (filters.action) where.action = { contains: filters.action }
  if (filters.entityType) where.entityType = filters.entityType
  if (filters.startDate || filters.endDate) {
    where.createdAt = {}
    if (filters.startDate) where.createdAt.gte = filters.startDate
    if (filters.endDate) where.createdAt.lte = filters.endDate
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
