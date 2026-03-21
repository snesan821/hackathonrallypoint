// Stub for @clerk/nextjs/server — used when no valid Clerk key is configured
// This file is aliased in next.config.js to replace @clerk/nextjs/server

export async function auth() {
  return { userId: null, sessionId: null, getToken: async () => null }
}

export async function currentUser() {
  return null
}

export function clerkMiddleware() {
  return () => {}
}

export type WebhookEvent = { type: string; data: any }
