'use client'

import { useEffect, useRef } from 'react'
import { MapPin, X, Loader2 } from 'lucide-react'
import { useUserLocation } from '@/lib/hooks/use-user-location'

interface LocationPromptProps {
  /** Called when location is resolved with city/state for filtering */
  onLocationResolved?: (location: { city?: string; county?: string; state?: string }) => void
  onLocationCleared?: () => void
}

export function LocationPrompt({ onLocationResolved, onLocationCleared }: LocationPromptProps) {
  const { location, status, error, requestLocation, clearLocation } = useUserLocation()
  const notifiedRef = useRef<string | null>(null)

  // Notify parent once when location is resolved (not on every render)
  useEffect(() => {
    if (status !== 'granted' || !location || !onLocationResolved) return

    const key = `${location.city}|${location.county}|${location.state}`
    if (notifiedRef.current === key) return

    notifiedRef.current = key
    onLocationResolved({ city: location.city, county: location.county, state: location.state })
  }, [status, location, onLocationResolved])

  const handleClear = () => {
    notifiedRef.current = null
    clearLocation()
    onLocationCleared?.()
  }

  // Already have location — show compact badge
  if (status === 'granted' && location) {
    const label = [location.city, location.state].filter(Boolean).join(', ') || 'Your location'
    return (
      <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm text-primary">
        <MapPin className="h-3.5 w-3.5" />
        <span className="font-medium">{label}</span>
        <button
          type="button"
          onClick={handleClear}
          className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
          aria-label="Clear location"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  // Requesting
  if (status === 'requesting') {
    return (
      <div className="flex items-center gap-2 rounded-full bg-surface-container px-3 py-1.5 text-sm text-on-surface-variant">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Getting your location…</span>
      </div>
    )
  }

  // Denied or error
  if (status === 'denied' || status === 'error') {
    return (
      <button
        type="button"
        onClick={requestLocation}
        className="flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
      >
        <MapPin className="h-3.5 w-3.5" />
        <span>{error || 'Location unavailable'} — Try again</span>
      </button>
    )
  }

  // Idle — show prompt button
  return (
    <button
      type="button"
      onClick={requestLocation}
      className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 transition-colors"
    >
      <MapPin className="h-3.5 w-3.5" />
      <span>Use my location for local issues</span>
    </button>
  )
}
