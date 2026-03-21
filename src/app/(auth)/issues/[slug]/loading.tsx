export default function IssueDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content skeleton */}
        <div className="lg:col-span-2">
          {/* Hero skeleton */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-8">
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
              </div>
              <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 animate-pulse rounded-t bg-slate-200" />
            ))}
          </div>

          {/* Content skeleton */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
