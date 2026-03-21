export default function ContactLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-12 text-center">
        <div className="h-12 w-64 bg-slate-200 rounded-lg animate-pulse mx-auto mb-4" />
        <div className="h-6 w-96 bg-slate-200 rounded animate-pulse mx-auto" />
      </div>
      
      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Info Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-12 w-12 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Form Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}