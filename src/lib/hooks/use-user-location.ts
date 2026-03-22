'use client'

import { useState, useEffect, useCallback } from 'react'

export interface UserLocation {
  latitude: number
  longitude: number
  city?: string
  county?: string
  state?: string
  zip?: string
}

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

const STORAGE_KEY = 'rallypoint:user-location'

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        setLocation(JSON.parse(stored))
        setStatus('granted')
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [])

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('Geolocation is not supported by your browser')
      return
    }

    setStatus('requesting')
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // 5 min cache
          })
        }
      )

      const { latitude, longitude } = position.coords

      // Reverse geocode to get city/state
      const res = await fetch('/api/user/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      })

      let loc: UserLocation = { latitude, longitude }

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          loc = { latitude, longitude, ...data.data }
        }
      }

      setLocation(loc)
      setStatus('granted')

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
      } catch {
        // sessionStorage unavailable
      }
    } catch (err: any) {
      if (err?.code === 1) {
        setStatus('denied')
        setError('Location access was denied')
      } else {
        setStatus('error')
        setError('Could not determine your location')
      }
    }
  }, [])

  const clearLocation = useCallback(() => {
    setLocation(null)
    setStatus('idle')
    setError(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // sessionStorage unavailable
    }
  }, [])

  return { location, status, error, requestLocation, clearLocation }
}
