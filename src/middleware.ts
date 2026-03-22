// This file is intentionally minimal.
// next.config.js swaps the actual implementation via webpack alias:
//   hasValidClerkKey=true  → src/lib/middleware-clerk.ts   (real Clerk)
//   hasValidClerkKey=false → src/lib/middleware-passthrough.ts (no-op)
export { default, config } from '#middleware-impl'
