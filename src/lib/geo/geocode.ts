import { redis } from '@/lib/cache/redis'

export interface GeocodeResult {
  latitude: number
  longitude: number
  normalizedAddress: string
  city?: string
  state?: string
  zip?: string
  county?: string
  confidence: number
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'RallyPoint/1.0 (civic-engagement-platform)'
const CACHE_TTL = 60 * 60 * 24 * 30 // 30 days

/**
 * Geocode an address using Nominatim (OpenStreetMap).
 * Results are cached in Redis for 30 days.
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const cacheKey = `geocode:${address.toLowerCase().trim()}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch {
    // Redis unavailable — continue without cache
  }

  try {
    const url = `${NOMINATIM_BASE}/search?${new URLSearchParams({
      q: address,
      format: 'json',
      addressdetails: '1',
      limit: '1',
    })}`

    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!res.ok) {
      console.error(`Nominatim error: ${res.status}`)
      return null
    }

    const data = await res.json()

    if (!data.length) return null

    const hit = data[0]
    const addr = hit.address || {}

    const result: GeocodeResult = {
      latitude: parseFloat(hit.lat),
      longitude: parseFloat(hit.lon),
      normalizedAddress: hit.display_name,
      city: addr.city || addr.town || addr.village,
      state: addr.state,
      zip: addr.postcode,
      county: addr.county,
      confidence: nominatimConfidence(hit),
    }

    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result))
    } catch {
      // Redis unavailable — skip caching
    }

    return result
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Reverse geocode coordinates to address components.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<Omit<GeocodeResult, 'latitude' | 'longitude'> | null> {
  const cacheKey = `reverse:${lat},${lng}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {
    // Redis unavailable
  }

  try {
    const url = `${NOMINATIM_BASE}/reverse?${new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
      addressdetails: '1',
    })}`

    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!res.ok) return null

    const hit = await res.json()
    if (hit.error) return null

    const addr = hit.address || {}

    const result = {
      normalizedAddress: hit.display_name,
      city: addr.city || addr.town || addr.village,
      state: addr.state,
      zip: addr.postcode,
      county: addr.county,
      confidence: 0.85,
    }

    try {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result))
    } catch {
      // Redis unavailable
    }

    return result
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

/**
 * Map Nominatim importance + class/type to a 0-1 confidence score.
 * Nominatim returns "importance" (0-1) and a "type" that indicates precision.
 */
function nominatimConfidence(hit: any): number {
  const importance = parseFloat(hit.importance) || 0.5
  const type: string = hit.type || ''

  // Boost for precise match types
  const preciseTypes = ['house', 'building', 'residential', 'apartments']
  const moderateTypes = ['postcode', 'suburb', 'neighbourhood', 'village']

  if (preciseTypes.includes(type)) return Math.min(importance + 0.2, 1)
  if (moderateTypes.includes(type)) return Math.min(importance + 0.1, 0.9)

  return importance
}
