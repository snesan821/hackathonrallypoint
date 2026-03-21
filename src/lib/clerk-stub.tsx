// Stub module that replaces @clerk/nextjs in local dev (no valid key)
// Provides no-op versions of all used Clerk exports

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function UserButton() {
  return null
}

export function SignInButton({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

export function useUser() {
  return { isLoaded: true, isSignedIn: false, user: null }
}

export function useAuth() {
  return { isLoaded: true, isSignedIn: false, userId: null }
}
