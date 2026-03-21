export default function FeedLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter skeleton */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
      </div>

      {/* Feed items skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                </div>
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              </div>

              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-8 w-20 animate-pulse rounded bg-slate-200" />
                  ))}
                </div>
                <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
