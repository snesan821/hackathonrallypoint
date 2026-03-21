'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield, Check, X, Eye, EyeOff, Trash2 } from 'lucide-react'

export default function ModerationPage() {
  const [queue, setQueue] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchQueue = async (pageNum: number = 1) => {
    setIsLoading(true)

    try {
      const res = await fetch(
        `/api/admin/moderation?status=${statusFilter}&page=${pageNum}&pageSize=10`
      )
      const data = await res.json()

      if (data.success) {
        setQueue(data.data)
        setTotalCount(data.pagination.totalCount)
      }
    } catch (error) {
      console.error('Failed to fetch moderation queue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchQueue(1)
  }, [statusFilter])

  const handleReview = async (
    flagId: string,
    action: 'DISMISS' | 'HIDE' | 'REMOVE',
    reviewNotes?: string
  ) => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId, action, reviewNotes }),
      })

      const data = await res.json()

      if (data.success) {
        // Remove from queue
        setQueue((prev) => prev.filter((item) => item.id !== flagId))
        setTotalCount((prev) => prev - 1)
      } else {
        alert('Failed to review flag: ' + data.error)
      }
    } catch (error) {
      console.error('Review failed:', error)
      alert('Failed to review flag')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-slate-900">Moderation Queue</h1>
        </div>
        <p className="mt-2 text-slate-600">
          Review flagged comments and take moderation actions
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {['PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED', 'ALL'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Queue list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <Shield className="mx-auto mb-3 h-12 w-12 text-slate-400" />
          <p className="text-lg font-medium text-slate-600">
            No {statusFilter.toLowerCase()} flags
          </p>
          <p className="mt-1 text-sm text-slate-500">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              {/* Flag header */}
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        item.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : item.status === 'ACTIONED'
                          ? 'bg-red-100 text-red-700'
                          : item.status === 'DISMISSED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {item.reason}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.details}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Flagged {new Date(item.createdAt).toLocaleString()} by{' '}
                    {item.reportedBy.displayName}
                  </p>
                </div>
              </div>

              {/* Comment content */}
              <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
                    {item.comment.author.avatarUrl ? (
                      <img
                        src={item.comment.author.avatarUrl}
                        alt={item.comment.author.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-slate-600">
                        {item.comment.author.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.comment.author.displayName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`ml-auto rounded px-2 py-1 text-xs font-medium ${
                      item.comment.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : item.comment.status === 'FLAGGED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.comment.status}
                  </span>
                </div>

                <p className="text-slate-700">{item.comment.sanitizedBody || item.comment.body}</p>

                {/* Context link */}
                <Link
                  href={`/issues/${item.comment.civicItem.slug}#comment-${item.comment.id}`}
                  className="mt-3 inline-block text-sm text-orange-600 hover:text-orange-700"
                >
                  View in context: {item.comment.civicItem.title}
                </Link>
              </div>

              {/* Actions */}
              {item.status === 'PENDING' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleReview(item.id, 'DISMISS')}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Check className="h-4 w-4" />
                    Dismiss Flag
                  </button>

                  <button
                    onClick={() => handleReview(item.id, 'HIDE')}
                    className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100"
                  >
                    <EyeOff className="h-4 w-4" />
                    Hide Comment
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to permanently remove this comment?'
                        )
                      ) {
                        handleReview(item.id, 'REMOVE')
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Comment
                  </button>
                </div>
              )}

              {/* Review info */}
              {item.reviewedBy && (
                <div className="mt-4 rounded bg-slate-100 p-3 text-sm text-slate-600">
                  Reviewed by {item.reviewedBy.displayName} on{' '}
                  {new Date(item.reviewedAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalCount > queue.length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              const nextPage = page + 1
              setPage(nextPage)
              fetchQueue(nextPage)
            }}
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Load More ({totalCount - queue.length} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
