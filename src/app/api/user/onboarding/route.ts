import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { validateAndStoreAddress } from '@/lib/geo/validation'
import { withAuth, withValidation, errorResponse, successResponse } from '@/lib/api/middleware'
import { z } from 'zod'
import { Category } from '@prisma/client'

/**
 * Validation schema for onboarding
 */
const onboardingSchema = z.object({
  displayName: z.string().min(2).max(100),
  interests: z.array(z.nativeEnum(Category)).min(1, 'Select at least one interest').max(10),
  address: z.string().min(5).max(200),
})

/**
 * POST /api/user/onboarding
 * Complete user onboarding process
 *
 * Sets displayName, interests, geocodes address, marks onboarding complete
 */
const handler = async (req: Request, { user, body }: any) => {
  try {
    const { displayName, interests, address } = body

    // Check if onboarding is already completed
    if (user.onboardingCompleted) {
      return errorResponse('Onboarding already completed', 400)
    }

    // Start transaction to ensure all operations complete or none
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update display name
      await tx.user.update({
        where: { id: user.id },
        data: { displayName },
      })

      // 2. Create user interests
      await tx.userInterest.createMany({
        data: interests.map((category: Category) => ({
          userId: user.id,
          category,
        })),
      })

      // 3. Geocode and store address (outside transaction since it calls external services)
      // We'll handle this after the transaction
      return { displayName, interests }
    })

    // 4. Geocode and store address
    let userAddress
    try {
      userAddress = await validateAndStoreAddress(user.id, address)
    } catch (error: any) {
      // If geocoding fails, still mark onboarding as complete
      // but notify user about address issue
      console.error('Address validation failed during onboarding:', error)

      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      })

      return NextResponse.json({
        success: true,
        data: {
          displayName: result.displayName,
          interests: result.interests,
          onboardingCompleted: true,
        },
        warning: 'Unable to verify address. You can update it later in settings.',
      })
    }

    // 5. Mark onboarding as complete
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
      include: {
        interests: {
          select: { category: true },
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
      },
    })

    return successResponse({
      id: updatedUser.id,
      displayName: updatedUser.displayName,
      interests: updatedUser.interests.map((i) => i.category),
      primaryAddress: updatedUser.addresses[0] || null,
      onboardingCompleted: true,
      message: 'Welcome to RallyPoint! Your profile is all set.',
    })
  } catch (error: any) {
    console.error('POST /api/user/onboarding error:', error)
    return errorResponse('Failed to complete onboarding')
  }
}

export const POST = withValidation(onboardingSchema)(withAuth(handler))
