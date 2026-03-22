import { redirect } from 'next/navigation'
import { getCurrentUserCached } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { AppShell } from '@/components/layout/AppShell'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user
  try {
    user = await getCurrentUserCached()
  } catch (error) {
    // Avoid retry loops on rate limiting or DB errors
    redirect('/sign-in')
  }

  if (!user) {
    redirect('/sign-in')
  }

  // Redirect to onboarding if not completed (but not if already on onboarding)
  if (!user.onboardingCompleted) {
    // We can't check the URL here easily in a layout, so we'll handle it in the onboarding page
  }

  // Fetch user's primary address for location display
  const primaryAddress = await prisma.userAddress.findFirst({
    where: {
      userId: user.id,
      isPrimary: true,
    },
    select: {
      city: true,
      state: true,
    },
  })

  const userWithAddress = {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: String(user.role),
    primaryAddress: primaryAddress
      ? { city: primaryAddress.city ?? '', state: primaryAddress.state ?? '' }
      : null,
  }

  return <AppShell user={JSON.parse(JSON.stringify(userWithAddress))}>{children}</AppShell>
}
