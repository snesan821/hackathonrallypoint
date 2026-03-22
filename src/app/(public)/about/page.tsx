import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="site-narrow py-16">
      <h1 className="mb-6 text-4xl font-bold text-on-surface font-headline">How It Works</h1>
      <p className="mb-12 text-lg text-on-surface-variant">
        RallyPoint makes civic participation accessible for everyone — especially
        first-time voters and civic newcomers in the Tempe, Phoenix, and Maricopa County area.
      </p>

      <div className="space-y-12">
        {[
          { step: '1', title: 'Discover Local Issues', description: 'Browse civic issues relevant to your neighborhood — from housing ordinances to school board decisions. Filter by category, jurisdiction, or deadline.', icon: '🔍' },
          { step: '2', title: 'Understand What Matters', description: 'AI-powered summaries break down complex policy documents into plain language. See who is affected, what changes, and why it matters — with links to original sources.', icon: '💡' },
          { step: '3', title: 'Take Action', description: 'Our progressive engagement ladder lets you start small and build up. Save issues, show support, share with friends, RSVP to hearings, or contact your representative.', icon: '✊' },
          { step: '4', title: 'Track Your Impact', description: 'See your civic participation history, track issues you care about, and watch community engagement grow over time.', icon: '📊' },
        ].map((item) => (
          <div key={item.step} className="flex gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl">
              {item.icon}
            </div>
            <div>
              <h2 className="mb-2 text-xl font-bold text-on-surface">Step {item.step}: {item.title}</h2>
              <p className="text-on-surface-variant">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-surface-container-low p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-on-surface font-headline">Ready to get started?</h2>
        <Link href="/sign-up" className="btn btn-primary inline-flex">Join RallyPoint</Link>
      </div>
    </div>
  )
}
