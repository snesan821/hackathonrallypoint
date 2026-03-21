// Stub for @clerk/nextjs — used when no valid Clerk key is configured (local dev)

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function UserButton() { return null }
export function SignInButton({ children }: { children?: React.ReactNode }) { return <>{children}</> }
export function SignIn() { return <div className="p-8 text-center text-slate-500">Sign-in disabled in local dev mode</div> }
export function SignUp() { return <div className="p-8 text-center text-slate-500">Sign-up disabled in local dev mode</div> }
export function useUser() { return { isLoaded: true, isSignedIn: true, user: null } }
export function useAuth() { return { isLoaded: true, isSignedIn: true, userId: 'local-dev' } }
