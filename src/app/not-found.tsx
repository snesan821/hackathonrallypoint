import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-surface-container-high p-4">
            <FileQuestion className="h-12 w-12 text-on-surface-variant" />
          </div>
        </div>

        <h1 className="mb-3 text-6xl font-bold text-on-surface font-headline">404</h1>
        <h2 className="mb-3 text-2xl font-bold text-on-surface">Page not found</h2>
        <p className="mb-8 text-on-surface-variant">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/feed" className="btn btn-primary w-full justify-center">
            <Home className="h-4 w-4" />
            Go to Home
          </Link>
          <Link href="/discover" className="btn btn-secondary w-full justify-center">
            <Search className="h-4 w-4" />
            Discover Issues
          </Link>
        </div>
      </div>
    </div>
  )
}
