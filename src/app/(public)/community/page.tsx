import Link from 'next/link'

export default function CommunityPage() {
  return (
    <div className="site-narrow py-16">
      <h1 className="mb-6 text-4xl font-bold text-on-surface font-headline">Community</h1>
      <p className="mb-12 text-lg text-on-surface-variant">
        RallyPoint is built by and for the civic community in Arizona. Join thousands
        of engaged citizens making their voices heard.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
          <h3 className="mb-2 text-lg font-bold text-on-surface">🗣️ Constructive Discussion</h3>
          <p className="text-sm text-on-surface-variant">
            Every civic issue has a community discussion space with threaded comments
            organized by type — questions, support, concerns, and evidence.
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
          <h3 className="mb-2 text-lg font-bold text-on-surface">🛡️ Community Moderation</h3>
          <p className="text-sm text-on-surface-variant">
            AI-assisted and human moderation keeps conversations productive and respectful.
            Our civility guidelines ensure everyone feels welcome.
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
          <h3 className="mb-2 text-lg font-bold text-on-surface">✅ Verified Information</h3>
          <p className="text-sm text-on-surface-variant">
            Civic items are verified by organizers and officials. AI summaries always
            link back to original source documents.
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6">
          <h3 className="mb-2 text-lg font-bold text-on-surface">📊 Community Impact</h3>
          <p className="text-sm text-on-surface-variant">
            Track how your community is engaging with local issues. See trending topics,
            participation stats, and collective progress.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {[
          { number: '2,400+', label: 'Students Engaged' },
          { number: '180+', label: 'Local Issues Tracked' },
          { number: '15', label: 'Districts Covered' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl font-bold text-primary font-headline">{stat.number}</div>
            <div className="mt-1 text-sm text-on-surface-variant">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-primary/5 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-on-surface font-headline">Join the conversation</h2>
        <p className="mb-6 text-on-surface-variant">
          Sign up to participate in community discussions and track local issues.
        </p>
        <Link href="/sign-up" className="btn btn-primary inline-flex">
          Get Started
        </Link>
      </div>
    </div>
  )
}
