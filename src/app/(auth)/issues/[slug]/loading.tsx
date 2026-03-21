export default function IssueDetailLoading() {
  return (
    <div className="site-wrap py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-24 skeleton rounded-full" />
                <div className="h-6 w-20 skeleton rounded-full" />
              </div>
              <div className="h-10 w-3/4 skeleton rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full skeleton rounded" />
                <div className="h-4 w-5/6 skeleton rounded" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-32 skeleton rounded" />
                <div className="h-4 w-24 skeleton rounded" />
              </div>
            </div>
          </div>
          <div className="mb-6 flex gap-2 border-b border-outline-variant/15">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 skeleton rounded-t" />
            ))}
          </div>
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 w-48 skeleton rounded" />
                  <div className="h-4 w-full skeleton rounded" />
                  <div className="h-4 w-4/5 skeleton rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <div className="mb-4 h-6 w-32 skeleton rounded" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 w-full skeleton rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
