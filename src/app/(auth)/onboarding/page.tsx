'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CIVIC_CATEGORIES } from '@/constants/categories'
import { cn } from '@/lib/utils/cn'
import { renderIcon } from '@/lib/utils/icons'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleCategory = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: selectedCategories }),
      })
      if (res.ok) {
        router.push('/feed')
        router.refresh()
      } else {
        const skipRes = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ onboardingCompleted: true }),
        })
        if (skipRes.ok) {
          router.push('/feed')
          router.refresh()
        }
      }
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setIsSubmitting(true)
    try {
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: [], skip: true }),
      })
    } catch { /* ignore */ }
    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,244,232,0.85),_transparent_38%),linear-gradient(180deg,_rgba(255,252,248,1)_0%,_rgba(250,246,241,1)_100%)] px-4 py-12 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="mb-3 text-4xl font-bold text-on-surface font-headline md:text-5xl">Welcome to RallyPoint!</h1>
          <p className="mx-auto max-w-2xl text-balance text-on-surface-variant">
            Select the civic topics you care about to personalize your feed
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {CIVIC_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => toggleCategory(cat.value)}
              className={cn(
                'group min-h-[168px] rounded-[28px] border p-6 text-left transition-all duration-200',
                'bg-white/80 shadow-[0_14px_34px_rgba(86,63,44,0.05)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(86,63,44,0.08)]',
                selectedCategories.includes(cat.value)
                  ? cat.selectedState
                  : 'border-outline-variant/15 hover:border-outline-variant/40'
              )}
            >
              <div
                className={cn(
                  'mb-6 flex size-14 items-center justify-center rounded-2xl border shadow-[0_10px_18px_rgba(28,27,27,0.04)]',
                  cat.iconSurface
                )}
              >
                {renderIcon(cat.icon, 24, cat.iconColor)}
              </div>
              <div className="text-xl font-semibold text-on-surface">{cat.label}</div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button onClick={handleSkip} disabled={isSubmitting} className="btn btn-secondary disabled:opacity-50">
            Skip for now
          </button>
          <button onClick={handleComplete} disabled={isSubmitting} className="btn btn-primary disabled:opacity-50">
            {isSubmitting ? 'Setting up...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
