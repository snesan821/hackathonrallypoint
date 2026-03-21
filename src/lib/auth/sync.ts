import { prisma } from '@/lib/db/prisma'

/**
 * Minimal shape of a Clerk user (works with both User and webhook UserJSON)
 */
interface ClerkUserData {
  id: string
  emailAddresses?: { emailAddress: string }[]
  email_addresses?: { email_address: string }[]
  firstName?: string | null
  first_name?: string | null
  lastName?: string | null
  last_name?: string | null
  username?: string | null
  imageUrl?: string
  image_url?: string
}

/**
 * Sync Clerk user data to our database
 * Called on user creation and updates
 */
export async function syncClerkUser(clerkUser: ClerkUserData) {
  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    (clerkUser.email_addresses as any)?.[0]?.email_address

  if (!email) {
    throw new Error('User must have an email address')
  }

  const firstName = clerkUser.firstName ?? clerkUser.first_name
  const lastName = clerkUser.lastName ?? clerkUser.last_name
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : clerkUser.username || firstName || 'User'

  const avatarUrl = clerkUser.imageUrl ?? clerkUser.image_url

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      displayName,
      avatarUrl: avatarUrl,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      displayName,
      avatarUrl: avatarUrl,
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
