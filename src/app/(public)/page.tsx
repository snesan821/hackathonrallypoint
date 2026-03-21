import Link from 'next/link'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { CivicItemCard } from '@/components/civic/CivicItemCard'

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-24 md:py-32">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="container relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Left: Hero content */}
            <div>
              <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl">
                Your voice matters here.
              </h1>
              <p className="mb-8 text-xl leading-relaxed text-slate-300">
                Discover local issues, understand their impact, and take meaningful action
                in your community. Built for first-time voters and civic newcomers.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-orange-700"
                >
                  Get Started
                </Link>
                <Link
                  href="/discover"
                  className="rounded-lg border-2 border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                >
                  Explore Issues
                </Link>
              </div>
            </div>

            {/* Right: Floating card preview */}
            <div className="hidden md:block">
              <div className="rotate-2 transform transition-transform hover:rotate-0">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-medium text-white">
                      Housing
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Tempe
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    Rent Stabilization Ordinance
                  </h3>
                  <p className="mb-3 text-sm text-slate-600">
                    A proposed city ordinance to limit annual rent increases and provide
                    tenant protections...
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-3/4 bg-gradient-to-r from-orange-500 to-orange-600" />
                  </div>
                  <p className="mt-2 text-xs text-slate-600">234 of 500 supporters (47%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="text-lg text-slate-600">
              Making civic participation accessible and impactful
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: '1',
                title: 'Discover',
                description: 'Find local issues relevant to your community and interests',
                icon: '🔍',
              },
              {
                step: '2',
                title: 'Understand',
                description: 'Get AI-powered summaries that break down complex policies',
                icon: '💡',
              },
              {
                step: '3',
                title: 'Engage',
                description: 'Take action through our progressive engagement ladder',
                icon: '✊',
              },
              {
                step: '4',
                title: 'Impact',
                description: 'Track your civic participation and community influence',
                icon: '📊',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="group relative rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-lg"
              >
                <div className="mb-4 text-5xl">{step.icon}</div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                </div>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue Categories */}
      <section className="bg-slate-50 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              See what's happening near you
            </h2>
            <p className="text-lg text-slate-600">
              Explore civic issues across 12 key categories
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {CIVIC_CATEGORIES.map((category) => (
              <Link
                key={category.value}
                href={`/discover?category=${category.value}`}
                className="group flex flex-col items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-orange-500 hover:shadow-lg"
              >
                <div className={`rounded-lg ${category.color} p-3 text-2xl`}>
                  {category.icon}
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-slate-900">{category.label}</h3>
                  <p className="mt-1 text-xs text-slate-600">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 px-4 py-20 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Making an Impact</h2>
            <p className="text-lg text-orange-100">
              Join thousands of engaged citizens in Arizona
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { number: '2,400+', label: 'Students Engaged' },
              { number: '180+', label: 'Local Issues Tracked' },
              { number: '15', label: 'Districts Covered' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mb-2 text-5xl font-bold">{stat.number}</div>
                <div className="text-lg text-orange-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="bg-white px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Built for real civic participation
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: 'Verified Actions',
                description: 'All civic items are verified by organizers or officials',
                icon: '✓',
              },
              {
                title: 'AI Transparency',
                description: 'Summaries are clearly labeled and link to original sources',
                icon: '🤖',
              },
              {
                title: 'Community Moderation',
                description: 'Automated and human moderation keeps discussions constructive',
                icon: '🛡️',
              },
              {
                title: 'No Spam',
                description: 'Fraud detection and rate limiting prevent abuse',
                icon: '🚫',
              },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-slate-200 p-6">
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 px-4 py-20">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to make your voice heard?
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            Join RallyPoint and start engaging with your local community today
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-lg bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-orange-700"
          >
            Get Started Free
          </Link>
          <p className="mt-4 text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-orange-400 hover:text-orange-300">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
