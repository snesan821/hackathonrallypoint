import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { AppShell } from '@/components/layout/AppShell'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Redirect to onboarding if not completed
  if (!user.onboardingCompleted) {
    redirect('/onboarding')
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
    role: user.role,
    primaryAddress,
  }

  return <AppShell user={userWithAddress}>{children}</AppShell>
}
