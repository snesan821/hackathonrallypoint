export default function ImpactLoading() {
  return (
    <div className="site-wrap py-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-56 skeleton rounded" />
        <div className="h-4 w-80 skeleton rounded" />
      </div>
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <div className="space-y-2">
              <div className="h-10 w-16 skeleton rounded" />
              <div className="h-4 w-24 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
          <div className="mb-4 h-6 w-32 skeleton rounded" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 skeleton rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 skeleton rounded" />
                  <div className="h-3 w-1/2 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
          <div className="mb-4 h-6 w-40 skeleton rounded" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 skeleton rounded" />
                  <div className="h-4 w-12 skeleton rounded" />
                </div>
                <div className="h-2 w-full skeleton rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
