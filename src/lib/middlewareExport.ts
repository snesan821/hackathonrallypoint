// This file is swapped at build time via next.config.js webpack alias:
// - No valid Clerk key → src/lib/middleware-passthrough.ts
// - Valid Clerk key    → src/lib/middleware-clerk.ts
export { default, config } from './middleware-clerk'
