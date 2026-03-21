import Link from 'next/link'

export default function CommunityPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold text-slate-900">Community</h1>
      <p className="mb-12 text-lg text-slate-600">
        RallyPoint is built by and for the civic community in Arizona. Join thousands
        of engaged citizens making their voices heard.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-6">
          <h3 className="mb-2 text-lg font-bold text-slate-900">🗣️ Constructive Discussion</h3>
          <p className="text-sm text-slate-600">
            Every civic issue has a community discussion space with threaded comments
            organized by type — questions, support, concerns, and evidence.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-6">
          <h3 className="mb-2 text-lg font-bold text-slate-900">🛡️ Community Moderation</h3>
          <p className="text-sm text-slate-600">
            AI-assisted and human moderation keeps conversations productive and respectful.
            Our civility guidelines ensure everyone feels welcome.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-6">
          <h3 className="mb-2 text-lg font-bold text-slate-900">✅ Verified Information</h3>
          <p className="text-sm text-slate-600">
            Civic items are verified by organizers and officials. AI summaries always
            link back to original source documents.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-6">
          <h3 className="mb-2 text-lg font-bold text-slate-900">📊 Community Impact</h3>
          <p className="text-sm text-slate-600">
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
            <div className="text-4xl font-bold text-orange-600">{stat.number}</div>
            <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl bg-orange-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Join the conversation</h2>
        <p className="mb-6 text-slate-600">
          Sign up to participate in community discussions and track local issues.
        </p>
        <Link
          href="/sign-up"
          className="inline-block rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}
