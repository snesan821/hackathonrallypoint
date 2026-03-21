'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-slate-900">
          Something went wrong
        </h1>

        <p className="mb-6 text-slate-600">
          We encountered an unexpected error. This has been logged and we'll look into it.
        </p>

        {error.digest && (
          <p className="mb-6 text-xs text-slate-500">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Try again
          </button>

          <a
            href="/feed"
            className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Return to Home
          </a>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          If this problem persists, please{' '}
          <a href="mailto:support@rallypoint.local" className="text-orange-600 hover:text-orange-700">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
