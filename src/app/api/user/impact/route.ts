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

    console.log('📊 Fetching impact stats for user:', user.id)

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

    console.log('Action counts:', actionCounts)

    // Get total issues engaged with
    const uniqueIssues = await prisma.engagementEvent.findMany({
      where: { userId: user.id },
      distinct: ['civicItemId'],
      select: { civicItemId: true },
    })

    console.log('Unique issues engaged:', uniqueIssues.length)

    // Get engagement by category
    let categoryDistribution: Array<{ category: string; count: number }> = []
    try {
      const engagementsByCategory = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
        SELECT DISTINCT unnest(ci.categories::text[]) as category, COUNT(*) as count
        FROM "EngagementEvent" ee
        JOIN "CivicItem" ci ON ee."civicItemId" = ci.id
        WHERE ee."userId" = ${user.id}
        GROUP BY category
        ORDER BY count DESC
      `

      categoryDistribution = engagementsByCategory.map((item) => ({
        category: item.category,
        count: Number(item.count),
      }))
    } catch (error) {
      console.error('Failed to fetch category distribution:', error)
      // Fallback: empty array
    }

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
    let streak = 0
    try {
      const engagementDates = await prisma.$queryRaw<Array<{ date: Date }>>`
        SELECT DISTINCT DATE("timestamp") as date
        FROM "EngagementEvent"
        WHERE "userId" = ${user.id}
        ORDER BY date DESC
        LIMIT 365
      `

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
    } catch (error) {
      console.error('Failed to calculate streak:', error)
      // Fallback: 0 streak
    }

    // Get comment count directly from Comment table
    let commentCount = 0
    let commentedIssues: any[] = []
    try {
      commentCount = await prisma.comment.count({
        where: { authorId: user.id },
      })

      // Get unique issues the user has commented on
      commentedIssues = await prisma.comment.findMany({
        where: { authorId: user.id },
        distinct: ['civicItemId'],
        select: { civicItemId: true },
      })

      console.log('Comments posted:', commentCount)
      console.log('Issues commented:', commentedIssues.length)
    } catch (error) {
      console.error('Failed to fetch comment stats:', error)
      // Fallback: 0 comments
    }

    const impact = {
      totals: {
        issuesViewed: actionCounts['VIEW'] || 0,
        issuesSaved: actionCounts['SAVE'] || 0,
        issuesSupported: actionCounts['SUPPORT'] || 0,
        commentsPosted: commentCount,
        issuesCommented: commentedIssues.length,
        actionsCompleted: Object.values(actionCounts).reduce((a, b) => a + b, 0),
        uniqueIssuesEngaged: uniqueIssues.length,
      },
      actionBreakdown: actionCounts,
      categoryDistribution,
      recentActivity: timeline,
      streak,
    }

    console.log('✅ Impact stats calculated successfully:', impact.totals)

    return successResponse(impact)
  } catch (error: any) {
    console.error('GET /api/user/impact error:', error)
    return errorResponse('Failed to fetch impact data')
  }
}