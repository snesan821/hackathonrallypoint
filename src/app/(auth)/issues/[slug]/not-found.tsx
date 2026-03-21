import Link from 'next/link'
import { FileQuestion, Search, TrendingUp } from 'lucide-react'

export default function IssueNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-slate-100 p-4">
            <FileQuestion className="h-12 w-12 text-slate-400" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-slate-900">
          Issue not found
        </h1>

        <p className="mb-8 text-slate-600">
          This civic issue doesn't exist or may have been removed. It might have expired or been closed by the organizer.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            <Search className="h-4 w-4" />
            Discover Other Issues
          </Link>

          <Link
            href="/feed"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            <TrendingUp className="h-4 w-4" />
            View Trending Issues
          </Link>
        </div>
      </div>
    </div>
  )
}
