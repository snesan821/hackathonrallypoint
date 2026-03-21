/**
 * Thin wrapper around Clerk server auth.
 * The string '@clerk/nextjs/server' must never appear in this file —
 * instead we import from the aliased path which next.config.js maps to
 * clerk-stub-server.ts when no valid key is present.
 *
 * The alias key in next.config.js is '@clerk/nextjs/server' → stub,
 * so we import from that alias here as a static import (webpack resolves it).
 */

// This import is resolved by the webpack alias in next.config.js:
//   '@clerk/nextjs/server' → src/lib/clerk-stub-server.ts  (when no valid key)
//   '@clerk/nextjs/server' → real package                  (when valid key present)
export { auth as getClerkAuth, currentUser as getClerkCurrentUser } from /* @clerk-server */ '@clerk/nextjs/server'
