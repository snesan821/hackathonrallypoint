import { ZIP_TO_DISTRICTS, getDistrictById } from '@/constants/arizona'
import type { CivicItem, UserAddress } from '@prisma/client'

export interface District {
  districtId: string
  districtName: string
  level: string
}

/**
 * Look up districts for given coordinates
 *
 * MVP Implementation: Uses ZIP code mapping
 * Production: Replace with PostGIS spatial queries against district boundary polygons
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @param zip - ZIP code (optional, improves accuracy)
 * @returns Array of districts
 */
export function lookupDistricts(
  lat: number,
  lng: number,
  zip?: string
): District[] {
  // MVP: Use ZIP code if available
  if (zip) {
    const districtIds = ZIP_TO_DISTRICTS[zip] || []
    return districtIds
      .map((id) => {
        const district = getDistrictById(id)
        return district
          ? {
              districtId: id,
              districtName: district.name,
              level: district.level as string,
            }
          : null
      })
      .filter((d): d is District => d !== null)
  }

  // Fallback: Determine approximate ZIP from coordinates
  // This is very rough for MVP - production should use reverse geocoding
  const approximateZip = approximateZipFromCoords(lat, lng)
  if (approximateZip) {
    return lookupDistricts(lat, lng, approximateZip)
  }

  // Default: Return county-level district if in Maricopa County area
  if (isInMaricopaCounty(lat, lng)) {
    return [
      {
        districtId: 'maricopa-county',
        districtName: 'Maricopa County',
        level: 'county',
      },
    ]
  }

  return []
}

/**
 * Check if user is in jurisdiction of a civic item
 *
 * @param userAddress - User's address with district IDs
 * @param civicItem - Civic item with jurisdiction info
 * @returns True if user is affected by this civic item
 */
export function isUserInJurisdiction(
  userAddress: UserAddress,
  civicItem: CivicItem
): boolean {
  const userDistrictIds = userAddress.districtIds as string[]
  const itemDistrictIds = civicItem.districtIds as string[]

  // Check if any user districts overlap with item districts
  const hasOverlap = userDistrictIds.some((userDist) =>
    itemDistrictIds.includes(userDist)
  )

  if (hasOverlap) return true

  // Also check jurisdiction tags
  const userJurisdictions = userAddress.jurisdictionTags || []
  const itemJurisdiction = civicItem.jurisdiction

  return userJurisdictions.some(
    (tag) => tag.toLowerCase() === itemJurisdiction.toLowerCase()
  )
}

/**
 * Get jurisdictions that affect a user based on their districts
 */
export function getUserJurisdictions(districtIds: string[]): string[] {
  const jurisdictions = new Set<string>()

  districtIds.forEach((id) => {
    const district = getDistrictById(id)
    if (district) {
      jurisdictions.add(district.jurisdiction)
    }
  })

  return Array.from(jurisdictions)
}

// ============================================================================
// HELPER FUNCTIONS (MVP)
// ============================================================================

/**
 * Approximate ZIP code from coordinates (very rough, MVP only)
 */
function approximateZipFromCoords(lat: number, lng: number): string | null {
  // Tempe area approximations
  if (lat >= 33.3 && lat <= 33.5 && lng >= -112.0 && lng <= -111.8) {
    // South Tempe/ASU area
    if (lat < 33.42) return '85281'
    // North Tempe
    if (lat >= 33.42 && lat < 33.44) return '85282'
    // Northwest Tempe
    return '85283'
  }

  return null
}

/**
 * Check if coordinates are in Maricopa County
 */
function isInMaricopaCounty(lat: number, lng: number): boolean {
  // Rough bounding box for Maricopa County
  return (
    lat >= 32.5 &&
    lat <= 34.0 &&
    lng >= -113.0 &&
    lng <= -111.0
  )
}

/**
 * Production implementation notes:
 *
 * With PostGIS and district boundary polygons:
 *
 * ```sql
 * SELECT district_id, district_name, level
 * FROM districts
 * WHERE ST_Contains(
 *   boundary,
 *   ST_SetSRID(ST_MakePoint($lng, $lat), 4326)
 * )
 * ```
 *
 * Benefits of PostGIS approach:
 * - Accurate boundary detection
 * - No approximation errors
 * - Handles complex district shapes
 * - Supports overlapping districts
 * - Can query "districts within X miles"
 *
 * Setup required:
 * 1. Enable PostGIS extension in Prisma
 * 2. Import district boundary data (GeoJSON or shapefiles)
 * 3. Create spatial indexes
 * 4. Use raw SQL queries or PostGIS-enabled ORM
 */
