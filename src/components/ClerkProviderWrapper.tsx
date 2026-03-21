'use client'

// When no valid Clerk key is set, next.config.js aliases @clerk/nextjs to clerk-stub.tsx
// which exports a no-op ClerkProvider. This wrapper just re-exports it transparently.
import { ClerkProvider } from '@clerk/nextjs'

export default function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>
}
