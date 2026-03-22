import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { syncClerkUser } from '@/lib/auth/sync'
import { cache } from 'react'

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

  // Keep the hot path read-only. Clerk webhook sync populates the DB for normal requests.
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (existingUser) {
    return existingUser
  }

  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Fall back to a one-time sync if the webhook has not populated the user yet.
  return syncClerkUser(clerkUser)
}

export const getCurrentUserCached = cache(getCurrentUser)

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
