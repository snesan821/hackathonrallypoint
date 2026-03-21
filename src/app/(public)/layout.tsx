import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { Search } from 'lucide-react'

const RallyPointLogo = () => (
  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" />
  </svg>
)

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
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/15 px-6 lg:px-20 py-4 flex items-center justify-between whitespace-nowrap">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 text-on-surface">
            <div className="size-6 text-primary">
              <RallyPointLogo />
            </div>
            <h2 className="text-xl font-bold tracking-tight">RallyPoint</h2>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'How It Works', href: '/about' },
              { label: 'Issues', href: '/discover' },
              { label: 'Community', href: '/community' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-on-surface-variant text-sm font-medium hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 justify-end gap-4 items-center">
          {userId ? (
            <>
              <Link
                href="/feed"
                className="px-5 h-10 inline-flex items-center bg-primary text-on-primary text-sm font-bold rounded-lg hover:bg-primary-container transition-all"
              >
                Go to Feed
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/sign-up"
                className="px-5 h-10 inline-flex items-center bg-primary text-on-primary text-sm font-bold rounded-lg hover:bg-primary-container transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/sign-in"
                className="px-5 h-10 inline-flex items-center bg-surface-container-high text-on-surface text-sm font-bold rounded-lg hover:bg-surface-variant transition-all"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
