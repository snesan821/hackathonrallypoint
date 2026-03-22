export default function DiscoverLoading() {
  return (
    <div className="site-wrap py-8">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 skeleton rounded" />
        <div className="h-4 w-96 skeleton rounded" />
      </div>
      <div className="mb-6 space-y-4">
        <div className="h-12 w-full skeleton rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-32 skeleton rounded-lg" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <div className="space-y-4">
              <div className="h-6 w-3/4 skeleton rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full skeleton rounded" />
                <div className="h-4 w-5/6 skeleton rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-20 skeleton rounded-full" />
                <div className="h-6 w-16 skeleton rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
