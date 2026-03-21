import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-slate-100 p-4">
            <FileQuestion className="h-12 w-12 text-slate-400" />
          </div>
        </div>

        <h1 className="mb-3 text-6xl font-bold text-slate-900">404</h1>

        <h2 className="mb-3 text-2xl font-bold text-slate-900">
          Page not found
        </h2>

        <p className="mb-8 text-slate-600">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/feed"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Link>

          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            <Search className="h-4 w-4" />
            Discover Issues
          </Link>
        </div>
      </div>
    </div>
  )
}
