import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'

export type UserRole = 'USER' | 'ORGANIZER' | 'MODERATOR' | 'ADMIN'

const IS_LOCAL_DEV =
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_')

export async function getCurrentUser() {
  if (IS_LOCAL_DEV) {
    return prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })
  }

  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      displayName:
        clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.username || 'User',
      avatarUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      displayName:
        clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.username || 'User',
      avatarUrl: clerkUser.imageUrl,
      role: 'USER',
      onboardingCompleted: false,
    },
  })
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  return user
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role as UserRole)) {
    throw new Error(`Unauthorized: requires one of ${roles.join(', ')}`)
  }
  return user
}
