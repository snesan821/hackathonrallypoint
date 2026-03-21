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
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-on-surface font-headline mb-2">Welcome to RallyPoint!</h1>
          <p className="text-on-surface-variant">
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
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant bg-surface-container-lowest hover:border-outline'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-medium text-on-surface">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
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
