export default function ContactLoading() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <div className="h-12 w-64 skeleton rounded-lg mx-auto mb-4" />
        <div className="h-6 w-96 skeleton rounded mx-auto" />
      </div>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="h-12 w-12 skeleton rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-24 skeleton rounded mb-2" />
                <div className="h-3 w-32 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 skeleton rounded" />
              <div className="h-10 w-full skeleton rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
