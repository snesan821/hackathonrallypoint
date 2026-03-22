export default function PrivacyLoading() {
  return (
    <div className="max-w-[960px] mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="h-12 w-64 skeleton rounded-lg mb-4" />
        <div className="h-4 w-48 skeleton rounded" />
      </div>
      
      <div className="space-y-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-8 w-48 skeleton rounded" />
            <div className="h-4 w-full skeleton rounded" />
            <div className="h-4 w-3/4 skeleton rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
