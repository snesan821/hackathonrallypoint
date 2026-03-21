// Stub for @clerk/nextjs/server — used when no valid Clerk key is configured

export async function auth() {
  return { userId: null, sessionId: null, getToken: async () => null }
}

export async function currentUser() {
  return null
}

export function clerkMiddleware() {
  return () => {}
}
