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

/**
 * Geocode an address using a geocoding API
 * Results are cached in Redis for 30 days
 *
 * MVP Implementation: Uses mock geocoding for Arizona addresses
 * Production: Replace with Google Maps Geocoding API or Nominatim
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const cacheKey = `geocode:${address.toLowerCase().trim()}`

  try {
    // Check cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // MVP: Mock geocoding for Arizona addresses
    // In production, replace this with actual geocoding API call
    const result = await mockGeocode(address)

    if (result) {
      // Cache for 30 days
      await redis.setex(cacheKey, 60 * 60 * 24 * 30, JSON.stringify(result))
    }

    return result
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Reverse geocode coordinates to an address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<Omit<GeocodeResult, 'latitude' | 'longitude'> | null> {
  const cacheKey = `reverse:${lat},${lng}`

  try {
    // Check cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // MVP: Mock reverse geocoding
    // Production: Replace with actual API call
    const result = await mockReverseGeocode(lat, lng)

    if (result) {
      await redis.setex(cacheKey, 60 * 60 * 24 * 30, JSON.stringify(result))
    }

    return result
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// ============================================================================
// MOCK GEOCODING (MVP)
// Replace with real geocoding API in production
// ============================================================================

/**
 * Mock geocoding for Arizona addresses
 * Returns realistic coordinates for common Tempe/Phoenix locations
 */
async function mockGeocode(address: string): Promise<GeocodeResult | null> {
  const normalized = address.toLowerCase()

  // Extract ZIP code if present
  const zipMatch = normalized.match(/\b\d{5}\b/)
  const zip = zipMatch ? zipMatch[0] : undefined

  // Mock data for common Arizona locations
  const mockLocations: Record<string, GeocodeResult> = {
    // Tempe locations
    'tempe': {
      latitude: 33.4255,
      longitude: -111.9400,
      normalizedAddress: 'Tempe, AZ',
      city: 'Tempe',
      state: 'AZ',
      county: 'Maricopa',
      confidence: 0.85,
    },
    'asu': {
      latitude: 33.4242,
      longitude: -111.9281,
      normalizedAddress: 'Arizona State University, Tempe, AZ 85281',
      city: 'Tempe',
      state: 'AZ',
      zip: '85281',
      county: 'Maricopa',
      confidence: 0.95,
    },
    '85281': {
      latitude: 33.4152,
      longitude: -111.9315,
      normalizedAddress: 'Tempe, AZ 85281',
      city: 'Tempe',
      state: 'AZ',
      zip: '85281',
      county: 'Maricopa',
      confidence: 0.90,
    },
    '85282': {
      latitude: 33.4269,
      longitude: -111.9401,
      normalizedAddress: 'Tempe, AZ 85282',
      city: 'Tempe',
      state: 'AZ',
      zip: '85282',
      county: 'Maricopa',
      confidence: 0.90,
    },
    // Phoenix
    'phoenix': {
      latitude: 33.4484,
      longitude: -112.0740,
      normalizedAddress: 'Phoenix, AZ',
      city: 'Phoenix',
      state: 'AZ',
      county: 'Maricopa',
      confidence: 0.85,
    },
    // Default Arizona
    'arizona': {
      latitude: 33.4484,
      longitude: -112.0740,
      normalizedAddress: 'Arizona',
      state: 'AZ',
      confidence: 0.70,
    },
  }

  // Try to match location
  for (const [key, location] of Object.entries(mockLocations)) {
    if (normalized.includes(key)) {
      return {
        ...location,
        zip: zip || location.zip,
      }
    }
  }

  // Default for any Arizona address
  if (normalized.includes('arizona') || normalized.includes('az')) {
    return {
      latitude: 33.4484,
      longitude: -112.0740,
      normalizedAddress: address,
      state: 'AZ',
      zip,
      confidence: 0.65,
    }
  }

  return null
}

/**
 * Mock reverse geocoding
 */
async function mockReverseGeocode(
  lat: number,
  lng: number
): Promise<Omit<GeocodeResult, 'latitude' | 'longitude'> | null> {
  // Check if coordinates are in Arizona area
  if (lat >= 31 && lat <= 37 && lng >= -115 && lng <= -109) {
    // Check if in Tempe area
    if (lat >= 33.3 && lat <= 33.5 && lng >= -112.0 && lng <= -111.8) {
      return {
        normalizedAddress: 'Tempe, AZ',
        city: 'Tempe',
        state: 'AZ',
        zip: '85281',
        county: 'Maricopa',
        confidence: 0.85,
      }
    }

    // Default Arizona
    return {
      normalizedAddress: 'Arizona',
      state: 'AZ',
      confidence: 0.70,
    }
  }

  return null
}

/**
 * Production geocoding implementation notes:
 *
 * For Google Maps Geocoding API:
 * ```
 * const response = await fetch(
 *   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GEOCODING_API_KEY}`
 * )
 * const data = await response.json()
 * // Parse data.results[0]...
 * ```
 *
 * For Nominatim (OpenStreetMap):
 * ```
 * const response = await fetch(
 *   `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`
 * )
 * const data = await response.json()
 * // Parse data[0]...
 * ```
 */
