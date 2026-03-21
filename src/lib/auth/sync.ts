import type { User as ClerkUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db/prisma'

/**
 * Sync Clerk user data to our database
 * Called on user creation and updates
 */
export async function syncClerkUser(clerkUser: ClerkUser) {
  const email = clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('User must have an email address')
  }

  const displayName =
    clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.username || clerkUser.firstName || 'User'

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      displayName,
      avatarUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      displayName,
      avatarUrl: clerkUser.imageUrl,
      role: 'USER',
      onboardingCompleted: false,
    },
  })

  return user
}

/**
 * Delete user from our database (called on Clerk user.deleted event)
 */
export async function deleteUser(clerkId: string) {
  await prisma.user.delete({
    where: { clerkId },
  })
}
