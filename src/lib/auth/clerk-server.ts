// This file is intentionally empty of @clerk imports.
// All Clerk server calls go through server.ts which checks IS_LOCAL_DEV first.
// When IS_LOCAL_DEV is true, Clerk is never called so the missing module never loads.

export {}
