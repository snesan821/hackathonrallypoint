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
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[var(--co-error)]/10 p-4">
            <AlertTriangle className="h-12 w-12 text-[var(--co-error)]" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-on-surface">Something went wrong</h1>
        <p className="mb-6 text-on-surface-variant">
          We encountered an unexpected error. This has been logged and we'll look into it.
        </p>

        {error.digest && (
          <p className="mb-6 text-xs text-on-surface-variant">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={reset} className="btn btn-primary w-full justify-center">
            Try again
          </button>
          <a href="/feed" className="btn btn-secondary w-full justify-center">
            Return to Home
          </a>
        </div>

        <p className="mt-6 text-sm text-on-surface-variant">
          If this problem persists, please{' '}
          <a href="mailto:support@rallypoint.local" className="text-primary hover:text-primary-container">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
