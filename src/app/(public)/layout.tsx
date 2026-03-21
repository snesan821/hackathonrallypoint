import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userId: string | null = null
  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch {
    // Clerk may not be available yet during environment setup
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">RallyPoint</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/discover"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Explore Issues
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              How It Works
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Community
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {userId ? (
              <>
                <Link
                  href="/feed"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Go to Feed
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
