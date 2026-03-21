import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUser } from '@/lib/auth/server'
import { Category } from '@prisma/client'

/**
 * POST /api/user/onboarding
 * Complete user onboarding process
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { interests = [], skip = false } = body

    if (skip || interests.length === 0) {
      // Skip onboarding — just mark complete
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      })

      return NextResponse.json({ success: true, data: { onboardingCompleted: true } })
    }

    // Save interests and mark complete
    const validInterests = interests.filter((i: string) =>
      Object.values(Category).includes(i as Category)
    )

    if (validInterests.length > 0) {
      await prisma.userInterest.createMany({
        data: validInterests.map((category: string) => ({
          userId: user.id,
          category: category as Category,
        })),
        skipDuplicates: true,
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingCompleted: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        interests: validInterests,
        onboardingCompleted: true,
      },
    })
  } catch (error: any) {
    console.error('POST /api/user/onboarding error:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
