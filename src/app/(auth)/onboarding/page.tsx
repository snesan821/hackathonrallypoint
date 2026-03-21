import { getCurrentUser } from '@/lib/auth/server'

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            Welcome to RallyPoint, {user.displayName}!
          </h1>
          <p className="text-muted-foreground">
            Let's personalize your civic engagement experience
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <p className="text-center text-muted-foreground">
            Onboarding flow components will be implemented in Phase 6-7.
          </p>
          <p className="text-center text-sm text-muted-foreground mt-4">
            For now, this page confirms authentication is working.
          </p>
        </div>
      </div>
    </div>
  )
}
