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
      const res = await fetch(`/api/admin/moderation?status=${statusFilter}&page=${pageNum}&pageSize=10`)
      const data = await res.json()
      if (data.success) { setQueue(data.data); setTotalCount(data.pagination.totalCount) }
    } catch (error) { console.error('Failed to fetch moderation queue:', error) }
    finally { setIsLoading(false) }
  }

  useEffect(() => { setPage(1); fetchQueue(1) }, [statusFilter])

  const handleReview = async (flagId: string, action: 'DISMISS' | 'HIDE' | 'REMOVE', reviewNotes?: string) => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId, action, reviewNotes }),
      })
      const data = await res.json()
      if (data.success) { setQueue((prev) => prev.filter((item) => item.id !== flagId)); setTotalCount((prev) => prev - 1) }
      else alert('Failed to review flag: ' + data.error)
    } catch (error) { console.error('Review failed:', error); alert('Failed to review flag') }
  }

  return (
    <div className="site-wrap py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-on-surface font-headline">Moderation Queue</h1>
        </div>
        <p className="mt-2 text-on-surface-variant">Review flagged comments and take moderation actions</p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-outline-variant/15">
        {['PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED', 'ALL'].map((status) => (
          <button
            key={status} onClick={() => setStatusFilter(status)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >{status}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-48 skeleton rounded-xl" />))}
        </div>
      ) : queue.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low p-12 text-center">
          <Shield className="mx-auto mb-3 h-12 w-12 text-on-surface-variant" />
          <p className="text-lg font-medium text-on-surface-variant">No {statusFilter.toLowerCase()} flags</p>
          <p className="mt-1 text-sm text-on-surface-variant">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.id} className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.status === 'PENDING' ? 'bg-[var(--co-warning)]/10 text-[var(--co-warning)]'
                        : item.status === 'ACTIONED' ? 'bg-[var(--co-error)]/10 text-[var(--co-error)]'
                        : item.status === 'DISMISSED' ? 'bg-[var(--co-success)]/10 text-[var(--co-success)]'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}>{item.status}</span>
                    <span className="rounded bg-surface-container-high px-2 py-1 text-xs font-medium text-on-surface-variant">{item.reason}</span>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">{item.details}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Flagged {new Date(item.createdAt).toLocaleString()} by {item.reportedBy.displayName}</p>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-surface-container-high">
                    {item.comment.author.avatarUrl ? (
                      <img src={item.comment.author.avatarUrl} alt={item.comment.author.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-on-surface-variant">{item.comment.author.displayName[0]?.toUpperCase()}</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">{item.comment.author.displayName}</p>
                    <p className="text-xs text-on-surface-variant">{new Date(item.comment.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`ml-auto rounded px-2 py-1 text-xs font-medium ${
                    item.comment.status === 'ACTIVE' ? 'bg-[var(--co-success)]/10 text-[var(--co-success)]'
                      : item.comment.status === 'FLAGGED' ? 'bg-[var(--co-warning)]/10 text-[var(--co-warning)]'
                      : 'bg-[var(--co-error)]/10 text-[var(--co-error)]'
                  }`}>{item.comment.status}</span>
                </div>
                <p className="text-on-surface-variant">{item.comment.sanitizedBody || item.comment.body}</p>
                <Link href={`/issues/${item.comment.civicItem.slug}#comment-${item.comment.id}`} className="mt-3 inline-block text-sm text-primary hover:text-primary-container">
                  View in context: {item.comment.civicItem.title}
                </Link>
              </div>

              {item.status === 'PENDING' && (
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleReview(item.id, 'DISMISS')} className="btn btn-secondary">
                    <Check className="h-4 w-4" /> Dismiss Flag
                  </button>
                  <button onClick={() => handleReview(item.id, 'HIDE')} className="inline-flex items-center gap-2 rounded-lg border border-[var(--co-warning)]/30 bg-[var(--co-warning)]/5 px-4 py-2 text-sm font-medium text-[var(--co-warning)] hover:bg-[var(--co-warning)]/10">
                    <EyeOff className="h-4 w-4" /> Hide Comment
                  </button>
                  <button
                    onClick={() => { if (confirm('Are you sure you want to permanently remove this comment?')) handleReview(item.id, 'REMOVE') }}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--co-error)]/30 bg-[var(--co-error)]/5 px-4 py-2 text-sm font-medium text-[var(--co-error)] hover:bg-[var(--co-error)]/10"
                  >
                    <Trash2 className="h-4 w-4" /> Remove Comment
                  </button>
                </div>
              )}

              {item.reviewedBy && (
                <div className="mt-4 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant">
                  Reviewed by {item.reviewedBy.displayName} on {new Date(item.reviewedAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && totalCount > queue.length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => { const nextPage = page + 1; setPage(nextPage); fetchQueue(nextPage) }}
            className="btn btn-primary"
          >
            Load More ({totalCount - queue.length} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
