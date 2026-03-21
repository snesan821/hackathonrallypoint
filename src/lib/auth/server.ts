import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'

export type UserRole = 'USER' | 'ORGANIZER' | 'MODERATOR' | 'ADMIN'

/**
 * Gets the current user from Clerk and syncs/fetches from our database
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Upsert user in our database
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      displayName: clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.username || 'User',
      avatarUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      displayName: clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.username || 'User',
      avatarUrl: clerkUser.imageUrl,
      role: 'USER',
      onboardingCompleted: false,
    },
  })

  return user
}

/**
 * Requires authentication - redirects to sign-in if not authenticated
 * Throws error if user not found in database
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return user
}

/**
 * Requires specific role(s) - throws error if user doesn't have required role
 */
export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth()

  if (!roles.includes(user.role as UserRole)) {
    throw new Error(`Unauthorized: requires one of ${roles.join(', ')}`)
  }

  return user
}
