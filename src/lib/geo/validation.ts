import { prisma } from '@/lib/db/prisma'
import { geocodeAddress } from './geocode'
import { lookupDistricts, getUserJurisdictions } from './districts'

/**
 * Validate and store user address
 * Orchestrates: geocoding → district lookup → database storage
 *
 * @param userId - User ID
 * @param rawAddress - Raw address string from user
 * @returns Created UserAddress record
 */
export async function validateAndStoreAddress(
  userId: string,
  rawAddress: string
) {
  // Step 1: Geocode the address
  const geocodeResult = await geocodeAddress(rawAddress)

  if (!geocodeResult) {
    throw new Error('Unable to geocode address. Please check and try again.')
  }

  // Step 2: Check confidence threshold
  if (geocodeResult.confidence < 0.7) {
    console.warn(
      `Low geocode confidence (${geocodeResult.confidence}) for address: ${rawAddress}`
    )
    // In production, you might flag this for manual review
    // For MVP, we'll proceed but log the warning
  }

  // Step 3: Look up districts
  const districts = lookupDistricts(
    geocodeResult.latitude,
    geocodeResult.longitude,
    geocodeResult.zip
  )

  const districtIds = districts.map((d) => d.districtId)

  // Step 4: Determine jurisdiction tags
  const jurisdictionTags = getUserJurisdictions(districtIds)

  // Add city and state to jurisdiction tags if available
  if (geocodeResult.city) {
    jurisdictionTags.push(geocodeResult.city)
  }
  if (geocodeResult.state) {
    jurisdictionTags.push(geocodeResult.state)
  }

  // Step 5: Unset any existing primary addresses for this user
  await prisma.userAddress.updateMany({
    where: {
      userId,
      isPrimary: true,
    },
    data: {
      isPrimary: false,
    },
  })

  // Step 6: Create new address record
  const userAddress = await prisma.userAddress.create({
    data: {
      userId,
      rawAddress,
      normalizedAddress: geocodeResult.normalizedAddress,
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      geocodeConfidence: geocodeResult.confidence,
      city: geocodeResult.city,
      state: geocodeResult.state,
      zip: geocodeResult.zip,
      county: geocodeResult.county,
      districtIds: JSON.parse(JSON.stringify(districtIds)), // Convert to JSON
      jurisdictionTags,
      isPrimary: true,
    },
  })

  return userAddress
}

/**
 * Get user's primary address
 */
export async function getUserPrimaryAddress(userId: string) {
  return await prisma.userAddress.findFirst({
    where: {
      userId,
      isPrimary: true,
    },
  })
}

/**
 * Validate address format (basic validation before geocoding)
 */
export function isValidAddressFormat(address: string): boolean {
  // Basic validation: must have some content and reasonable length
  const trimmed = address.trim()

  if (trimmed.length < 5 || trimmed.length > 200) {
    return false
  }

  // Should contain at least one number (street address)
  // This is a very basic check
  const hasNumber = /\d/.test(trimmed)

  return hasNumber
}
