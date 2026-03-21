import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { withAuth, withValidation, errorResponse, successResponse } from '@/lib/api/middleware'
import { z } from 'zod'
import { Category } from '@prisma/client'

/**
 * Validation schema for profile update
 */
const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  interests: z.array(z.nativeEnum(Category)).optional(),
})

/**
 * GET /api/user/profile
 * Get current user's profile with interests, address, and engagement stats
 */
const getHandler = async (req: Request, { user }: any) => {
  try {
    // Fetch user with related data
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        interests: {
          select: {
            category: true,
          },
        },
        addresses: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            city: true,
            state: true,
            zip: true,
            districtIds: true,
            jurisdictionTags: true,
          },
        },
        _count: {
          select: {
            engagements: true,
            comments: true,
          },
        },
      },
    })

    if (!userProfile) {
      return errorResponse('User not found', 404)
    }

    // Get engagement stats
    const engagements = await prisma.engagementEvent.groupBy({
      by: ['action'],
      where: { userId: user.id },
      _count: { action: true },
    })

    const engagementStats = engagements.reduce((acc, curr) => {
      acc[curr.action.toLowerCase()] = curr._count.action
      return acc
    }, {} as Record<string, number>)

    // Calculate total issues viewed/saved/supported
    const viewed = engagementStats['view'] || 0
    const saved = engagementStats['save'] || 0
    const supported = engagementStats['support'] || 0

    const profile = {
      id: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.displayName,
      avatarUrl: userProfile.avatarUrl,
      role: userProfile.role,
      onboardingCompleted: userProfile.onboardingCompleted,
      interests: userProfile.interests.map((i) => i.category),
      primaryAddress: userProfile.addresses[0] || null,
      stats: {
        issuesViewed: viewed,
        issuesSaved: saved,
        issuesSupported: supported,
        commentsPosted: userProfile._count.comments,
        actionsCompleted: Object.values(engagementStats).reduce((a, b) => a + b, 0),
      },
      createdAt: userProfile.createdAt,
    }

    return successResponse(profile)
  } catch (error: any) {
    console.error('GET /api/user/profile error:', error)
    return errorResponse('Failed to fetch profile')
  }
}

/**
 * PATCH /api/user/profile
 * Update user's profile (displayName and interests)
 */
const patchHandler = async (req: Request, { user, body }: any) => {
  try {
    const { displayName, interests } = body

    // Update user
    const updates: any = {}
    if (displayName !== undefined) {
      updates.displayName = displayName
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      })
    }

    // Update interests if provided
    if (interests !== undefined) {
      // Delete existing interests
      await prisma.userInterest.deleteMany({
        where: { userId: user.id },
      })

      // Create new interests
      if (interests.length > 0) {
        await prisma.userInterest.createMany({
          data: interests.map((category: Category) => ({
            userId: user.id,
            category,
          })),
        })
      }
    }

    // Fetch updated profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        interests: {
          select: {
            category: true,
          },
        },
      },
    })

    return successResponse({
      id: updatedUser!.id,
      displayName: updatedUser!.displayName,
      interests: updatedUser!.interests.map((i) => i.category),
      message: 'Profile updated successfully',
    })
  } catch (error: any) {
    console.error('PATCH /api/user/profile error:', error)
    return errorResponse('Failed to update profile')
  }
}

export const GET = withAuth(getHandler)
export const PATCH = withValidation(updateProfileSchema)(withAuth(patchHandler))
