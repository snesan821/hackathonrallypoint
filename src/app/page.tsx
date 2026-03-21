export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <main className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          Rally<span className="text-primary">Point</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your voice matters here.
        </p>
        <p className="text-sm text-muted-foreground">
          Civic engagement platform for Tempe, Phoenix, and Maricopa County
        </p>
        <div className="mt-12 space-y-2 text-sm text-muted-foreground">
          <p>✅ Project scaffolding complete</p>
          <p>✅ Database schema ready</p>
          <p>✅ TypeScript types and constants defined</p>
          <p className="mt-4 font-medium">
            Ready for Phase 3+ implementation
          </p>
        </div>
      </main>
    </div>
  )
}
