'use client'

import { ClerkProvider } from '@clerk/nextjs'

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const hasValidClerkKey =
  publishableKey?.startsWith('pk_test_') || publishableKey?.startsWith('pk_live_')

export default function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!hasValidClerkKey) return <>{children}</>
  return <ClerkProvider publishableKey={publishableKey!}>{children}</ClerkProvider>
}
