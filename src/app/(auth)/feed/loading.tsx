export default function FeedLoading() {
  return (
    <div className="site-wrap py-8">
      <div className="mb-6 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 skeleton rounded" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-24 skeleton rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-20 skeleton rounded" />
                  <div className="h-6 w-3/4 skeleton rounded" />
                </div>
                <div className="h-8 w-16 skeleton rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full skeleton rounded" />
                <div className="h-4 w-5/6 skeleton rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 skeleton rounded-full" />
                <div className="h-6 w-24 skeleton rounded-full" />
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/15 pt-4">
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-8 w-20 skeleton rounded" />
                  ))}
                </div>
                <div className="h-8 w-24 skeleton rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
