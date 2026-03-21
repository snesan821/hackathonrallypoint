export default function PrivacyLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <div className="h-12 w-64 bg-slate-200 rounded-lg animate-pulse mb-4" />
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
      </div>
      
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}