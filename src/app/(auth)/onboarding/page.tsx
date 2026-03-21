'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CIVIC_CATEGORIES } from '@/constants/categories'

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
        body: JSON.stringify({
          interests: selectedCategories,
        }),
      })

      if (res.ok) {
        router.push('/feed')
        router.refresh()
      } else {
        // If the API fails, try to skip onboarding directly
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
    } catch {
      // ignore
    }
    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome to RallyPoint!</h1>
          <p className="text-slate-600">
            Select the civic topics you care about to personalize your feed
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {CIVIC_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => toggleCategory(cat.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                selectedCategories.includes(cat.value)
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-medium text-slate-900">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Skip for now
          </button>
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Setting up...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
