// Proxy for Clerk server functions.
// In local dev (no valid key), next.config.js aliases THIS file to clerk-stub-server.ts
// In production, this re-exports from the real @clerk/nextjs/server
export { auth, currentUser } from '@clerk/nextjs/server'
