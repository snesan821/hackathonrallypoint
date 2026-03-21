import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/server'
import { errorResponse, successResponse } from '@/lib/api/middleware'
import { EngagementAction } from '@prisma/client'

/**
 * GET /api/user/impact
 * Get user's personal impact dashboard data
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    // Get total engagement stats by action
    const engagementsByAction = await prisma.engagementEvent.groupBy({
      by: ['action'],
      where: { userId: user.id },
      _count: { action: true },
    })

    const actionCounts = engagementsByAction.reduce((acc, curr) => {
      acc[curr.action] = curr._count.action
      return acc
    }, {} as Record<EngagementAction, number>)

    // Get total issues engaged with
    const uniqueIssues = await prisma.engagementEvent.findMany({
      where: { userId: user.id },
      distinct: ['civicItemId'],
      select: { civicItemId: true },
    })

    // Get engagement by category
    const engagementsByCategory = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT DISTINCT unnest(ci.categories::text[]) as category, COUNT(*) as count
      FROM "EngagementEvent" ee
      JOIN "CivicItem" ci ON ee."civicItemId" = ci.id
      WHERE ee."userId" = ${user.id}
      GROUP BY category
      ORDER BY count DESC
    `

    const categoryDistribution = engagementsByCategory.map((item) => ({
      category: item.category,
      count: Number(item.count),
    }))

    // Get recent activity timeline (last 20 engagements)
    const recentActivity = await prisma.engagementEvent.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: {
        civicItem: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
          },
        },
      },
    })

    const timeline = recentActivity.map((event) => ({
      action: event.action,
      civicItem: event.civicItem,
      timestamp: event.timestamp,
    }))

    // Calculate engagement streak (consecutive days with at least one engagement)
    const engagementDates = await prisma.$queryRaw<Array<{ date: Date }>>`
      SELECT DISTINCT DATE("timestamp") as date
      FROM "EngagementEvent"
      WHERE "userId" = ${user.id}
      ORDER BY date DESC
      LIMIT 365
    `

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < engagementDates.length; i++) {
      const date = new Date(engagementDates[i].date)
      date.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === i) {
        streak++
      } else {
        break
      }
    }

    // Get comment count
    const commentCount = await prisma.comment.count({
      where: { authorId: user.id },
    })

    const impact = {
      totals: {
        issuesViewed: actionCounts['VIEW'] || 0,
        issuesSaved: actionCounts['SAVE'] || 0,
        issuesSupported: actionCounts['SUPPORT'] || 0,
        commentsPosted: commentCount,
        actionsCompleted: Object.values(actionCounts).reduce((a, b) => a + b, 0),
        uniqueIssuesEngaged: uniqueIssues.length,
      },
      actionBreakdown: actionCounts,
      categoryDistribution,
      recentActivity: timeline,
      streak,
    }

    return successResponse(impact)
  } catch (error: any) {
    console.error('GET /api/user/impact error:', error)
    return errorResponse('Failed to fetch impact data')
  }
}