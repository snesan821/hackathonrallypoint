import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/(auth)(.*)',
  '/admin(.*)',
])

// Define public API routes
const isPublicApiRoute = createRouteMatcher([
  '/api/public(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public API routes
  if (isPublicApiRoute(req)) {
    return
  }

  // Protect auth and admin routes
  if (isProtectedRoute(req)) {
    try {
      const { userId } = await auth()
      if (!userId) {
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname)
        return Response.redirect(signInUrl)
      }
    } catch (e) {
      // If auth fails (e.g. missing keys), redirect to sign-in
      const signInUrl = new URL('/sign-in', req.url)
      return Response.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
