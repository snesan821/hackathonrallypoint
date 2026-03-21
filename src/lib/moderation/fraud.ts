import { prisma } from '@/lib/db/prisma'
import { EngagementAction, SignalType, SignalSeverity } from '@prisma/client'

/**
 * Check for rapid actions from a user
 * Detects if a user is performing too many actions too quickly (possible bot)
 *
 * @param userId - User to check
 * @returns True if rapid actions detected
 */
export async function checkRapidActions(userId: string): Promise<boolean> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

  const recentActions = await prisma.engagementEvent.count({
    where: {
      userId,
      timestamp: { gte: fiveMinutesAgo },
    },
  })

  // If more than 50 actions in 5 minutes, flag as suspicious
  if (recentActions > 50) {
    await logFraudSignal({
      userId,
      signalType: 'RAPID_ACTIONS',
      severity: 'HIGH',
      details: {
        actionCount: recentActions,
        timeWindow: '5 minutes',
        threshold: 50,
      },
    })
    return true
  }

  return false
}

/**
 * Check for duplicate action patterns
 * Detects if a user is repeatedly taking and reversing the same action
 * (e.g., support/unsupport cycling)
 *
 * @param userId - User to check
 * @param action - Action type
 * @param civicItemId - Civic item ID
 * @returns True if suspicious pattern detected
 */
export async function checkDuplicatePatterns(
  userId: string,
  action: EngagementAction,
  civicItemId: string
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  // Count how many times this specific action was taken in the last hour
  const actionCount = await prisma.engagementEvent.count({
    where: {
      userId,
      civicItemId,
      action,
      timestamp: { gte: oneHourAgo },
    },
  })

  // If same action taken more than 5 times in an hour, flag it
  if (actionCount > 5) {
    await logFraudSignal({
      userId,
      signalType: 'SUSPICIOUS_PATTERN',
      severity: 'MEDIUM',
      details: {
        action,
        civicItemId,
        actionCount,
        timeWindow: '1 hour',
        pattern: 'repeated_action',
      },
    })
    return true
  }

  return false
}

/**
 * Check for bot-like behavior patterns
 * Looks for multiple signals that might indicate automated behavior
 *
 * @param userId - User to check
 * @returns True if bot-like behavior detected
 */
export async function checkBotBehavior(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  // Get all recent actions
  const recentActions = await prisma.engagementEvent.findMany({
    where: {
      userId,
      timestamp: { gte: oneHourAgo },
    },
    orderBy: { timestamp: 'asc' },
  })

  if (recentActions.length === 0) return false

  // Check for perfectly timed intervals (bot-like)
  const timestamps = recentActions.map((a) => a.timestamp.getTime())
  const intervals: number[] = []

  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1])
  }

  // If intervals are suspiciously consistent (within 100ms variance)
  if (intervals.length > 10) {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance =
      intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) /
      intervals.length

    // Very low variance suggests automated timing
    if (variance < 100) {
      await logFraudSignal({
        userId,
        signalType: 'BOT_DETECTED',
        severity: 'CRITICAL',
        details: {
          actionCount: recentActions.length,
          avgInterval: Math.round(avgInterval),
          variance: Math.round(variance),
          pattern: 'consistent_timing',
        },
      })
      return true
    }
  }

  return false
}

/**
 * Check for duplicate IP addresses across multiple accounts
 * Note: IPs are hashed before storage for privacy
 *
 * @param ipHash - Hashed IP address
 * @returns True if suspicious IP usage detected
 */
export async function checkDuplicateIP(ipHash: string): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Count distinct users from this IP in last 24 hours
  const usersFromIP = await prisma.auditLog.findMany({
    where: {
      ipHash,
      createdAt: { gte: oneDayAgo },
    },
    distinct: ['userId'],
    select: { userId: true },
  })

  // If more than 5 different users from same IP, flag it
  if (usersFromIP.length > 5) {
    await logFraudSignal({
      userId: null, // IP-based signal, not user-specific
      signalType: 'DUPLICATE_IP',
      severity: 'MEDIUM',
      details: {
        ipHash,
        userCount: usersFromIP.length,
        timeWindow: '24 hours',
      },
    })
    return true
  }

  return false
}

/**
 * Log a fraud signal to the database
 *
 * @param signal - Fraud signal details
 */
export async function logFraudSignal(signal: {
  userId: string | null
  signalType: SignalType
  severity: SignalSeverity
  details: any
}) {
  await prisma.fraudSignal.create({
    data: {
      userId: signal.userId || undefined,
      signalType: signal.signalType,
      severity: signal.severity,
      details: signal.details,
      resolved: false,
    },
  })

  // Log to console for immediate visibility
  console.warn('[Fraud Detection]', signal)
}

/**
 * Get fraud signals for a user
 *
 * @param userId - User ID
 * @param onlyUnresolved - Only return unresolved signals
 * @returns Array of fraud signals
 */
export async function getUserFraudSignals(userId: string, onlyUnresolved = true) {
  return prisma.fraudSignal.findMany({
    where: {
      userId,
      ...(onlyUnresolved ? { resolved: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Resolve a fraud signal (admin action)
 *
 * @param signalId - Signal ID to resolve
 * @param adminId - Admin user ID
 */
export async function resolveFraudSignal(signalId: string, adminId: string) {
  await prisma.fraudSignal.update({
    where: { id: signalId },
    data: { resolved: true },
  })

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: 'FRAUD_SIGNAL_RESOLVED',
      entityType: 'FraudSignal',
      entityId: signalId,
      metadata: {},
    },
  })
}

/**
 * Check if a user is currently flagged for fraud
 * This can be used to apply restrictions or additional verification
 *
 * @param userId - User ID
 * @returns True if user has active fraud signals
 */
export async function isUserFlagged(userId: string): Promise<boolean> {
  const unresolvedSignals = await getUserFraudSignals(userId, true)
  return unresolvedSignals.length > 0
}

/**
 * Comprehensive fraud check for engagement actions
 * Runs all fraud detection checks
 *
 * @param userId - User ID
 * @param action - Engagement action
 * @param civicItemId - Civic item ID
 * @returns True if fraud detected
 */
export async function checkEngagementFraud(
  userId: string,
  action: EngagementAction,
  civicItemId: string
): Promise<boolean> {
  const checks = await Promise.all([
    checkRapidActions(userId),
    checkDuplicatePatterns(userId, action, civicItemId),
    checkBotBehavior(userId),
  ])

  // Return true if any check detected fraud
  return checks.some((result) => result === true)
}
