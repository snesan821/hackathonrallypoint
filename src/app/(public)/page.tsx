import Link from 'next/link'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { renderIcon } from '@/lib/utils/icons'
import { HeroStabilizer } from '@/components/landing/HeroStabilizer'
import {
  ShieldCheck,
  Scale,
  Eye,
} from 'lucide-react'

const trustFeatures = [
  {
    title: 'Verified Residency',
    desc: 'We use address verification to ensure only real neighbors are voting and debating on local issues.',
    icon: ShieldCheck,
  },
  {
    title: 'Civil Discourse',
    desc: 'Our AI moderation flags harassment while preserving heated, passionate policy debate.',
    icon: Scale,
  },
  {
    title: 'Full Transparency',
    desc: 'See exactly how your feedback is being processed and shared with city council members.',
    icon: Eye,
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="max-w-[1280px] w-full mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
          <div className="flex flex-col gap-8 order-2 lg:order-1">
            <div className="flex flex-col gap-4">
              <span className="text-primary font-bold tracking-widest text-xs uppercase">
                Your Voice Matters Here
              </span>
              <h1 className="text-on-surface text-5xl lg:text-7xl font-black leading-[1.1] tracking-[-0.03em]">
                Join the <br />
                <span className="text-primary italic font-headline">conversation</span> that
                shapes your city.
              </h1>
              <p className="text-on-surface-variant text-lg lg:text-xl leading-relaxed max-w-lg">
                A modern space for community engagement, transparent policy discussion, and
                collective action. Connect with neighbors and influence real change.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-4 bg-primary text-on-primary text-base font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/discover"
                className="px-8 py-4 bg-surface-container-highest text-on-surface text-base font-bold rounded-xl hover:bg-surface-variant transition-all"
              >
                Explore Issues
              </Link>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <HeroStabilizer />
          </div>
        </div>
      </section>

      {/* Categories Section — uses CIVIC_CATEGORIES from constants */}
      <section className="max-w-[1280px] w-full mx-auto px-6 py-20 border-t border-outline-variant/15">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 font-headline">Browse by category</h2>
            <p className="text-on-surface-variant text-lg">
              Filter discussions by the topics that affect your daily life most. Every category is moderated for constructive dialogue.
            </p>
          </div>
          <Link href="/discover" className="text-primary font-bold flex items-center gap-2 pb-1 border-b-2 border-primary/20 hover:border-primary transition-all">
            View all categories
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CIVIC_CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/discover?category=${cat.value}`}
              className="group bg-surface-container-low p-6 rounded-2xl flex flex-col gap-4 hover:bg-primary transition-all cursor-pointer"
            >
              <div className="size-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary group-hover:bg-on-primary transition-colors">
                {renderIcon(cat.icon, 24, "h-6 w-6")}
              </div>
              <div>
                <span className="font-bold text-on-surface group-hover:text-on-primary transition-colors">{cat.label}</span>
                {cat.description && (
                  <p className="mt-1 text-xs text-on-surface-variant group-hover:text-on-primary/70 transition-colors">{cat.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="max-w-[1280px] w-full mx-auto px-6">
        <div className="py-24 bg-surface-container-low rounded-3xl px-8 lg:px-20 my-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight font-headline">
                Civic engagement that actually works.
              </h2>
              <p className="text-on-surface-variant text-lg mb-12">
                We bridge the gap between residents and city officials. Our platform ensures every verified voice is heard, documented, and delivered to decision-makers.
              </p>
              <div className="grid grid-cols-2 gap-12">
                <div className="flex flex-col">
                  <span className="text-primary text-5xl font-black italic font-headline">30+</span>
                  <span className="text-on-surface font-bold text-lg mt-2">Policies Tracked</span>
                  <p className="text-on-surface-variant text-sm">Local bills, ordinances, and initiatives monitored.</p>
                </div>
                <div className="flex flex-col">
                  <span className="text-primary text-5xl font-black italic font-headline">100+</span>
                  <span className="text-on-surface font-bold text-lg mt-2">Engagements</span>
                  <p className="text-on-surface-variant text-sm">Community actions taken on civic issues.</p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-2xl p-2 shadow-inner border border-outline-variant/10">
              <div className="rounded-xl w-full bg-surface-container-lowest p-6">
                <h3 className="text-xl font-bold text-on-surface font-headline mb-5">Categories You&rsquo;re Engaged With</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Education', emoji: '🎓', color: 'bg-purple-500', width: '100%', count: 9 },
                    { label: 'Environment', emoji: '🌿', color: 'bg-emerald-500', width: '56%', count: 5 },
                    { label: 'Housing', emoji: '🏠', color: 'bg-emerald-500', width: '56%', count: 5 },
                    { label: 'Healthcare', emoji: '💗', color: 'bg-pink-500', width: '44%', count: 4 },
                    { label: 'Public Safety', emoji: '🛡️', color: 'bg-red-500', width: '33%', count: 3 },
                    { label: 'Civil Rights', emoji: '⚖️', color: 'bg-indigo-500', width: '22%', count: 2 },
                    { label: 'Transit', emoji: '🚌', color: 'bg-emerald-600', width: '22%', count: 2 },
                    { label: 'Budget & Taxes', emoji: '💰', color: 'bg-yellow-500', width: '11%', count: 1 },
                  ].map((cat) => (
                    <div key={cat.label} className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full ${cat.color} px-3 py-1 text-xs font-semibold text-white whitespace-nowrap`}>
                        <span>{cat.emoji}</span> {cat.label}
                      </span>
                      <div className="flex-1">
                        <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: cat.width }} />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-on-surface-variant w-5 text-right">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="max-w-[1280px] w-full mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 font-headline">A safer space for citizens</h2>
          <p className="text-on-surface-variant text-lg">
            We prioritize accountability and respect. Our community standards are enforced by both technology and human moderation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustFeatures.map((feature) => (
            <div key={feature.title} className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 hover:shadow-xl transition-all">
              <feature.icon className="text-primary mb-6" size={36} strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1280px] w-full mx-auto px-6 py-20">
        <div className="relative bg-primary text-on-primary p-12 lg:p-24 rounded-[3rem] overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern height="40" id="pattern-grid" patternUnits="userSpaceOnUse" width="40" x="0" y="0">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
              <rect fill="url(#pattern-grid)" height="100%" width="100%" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-8 text-center">
            <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-none font-headline">Ready to lead?</h2>
            <p className="text-lg lg:text-xl max-w-xl opacity-90">
              Start a discussion today or join one in progress. Your community is waiting to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up"
                className="px-10 py-5 bg-surface-container-lowest text-primary text-lg font-black rounded-2xl hover:bg-surface-bright transition-all"
              >
                Create My Account
              </Link>
              <Link
                href="/about"
                className="px-10 py-5 border-2 border-on-primary text-on-primary text-lg font-black rounded-2xl hover:bg-on-primary hover:text-primary transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
