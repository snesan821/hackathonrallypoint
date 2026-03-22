import Link from 'next/link'
import { FileQuestion, Search, TrendingUp } from 'lucide-react'

export default function IssueNotFound() {
  return (
    <div className="site-wrap py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-surface-container-high p-4">
            <FileQuestion className="h-12 w-12 text-on-surface-variant" />
          </div>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-on-surface">Issue not found</h1>
        <p className="mb-8 text-on-surface-variant">
          This civic issue doesn't exist or may have been removed. It might have expired or been closed by the organizer.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/discover" className="btn btn-primary w-full justify-center">
            <Search className="h-4 w-4" /> Discover Other Issues
          </Link>
          <Link href="/feed" className="btn btn-secondary w-full justify-center">
            <TrendingUp className="h-4 w-4" /> View Trending Issues
          </Link>
        </div>
      </div>
    </div>
  )
}
