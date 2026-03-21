import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { validateAndStoreAddress, getUserPrimaryAddress } from '@/lib/geo/validation'
import { addressSchema } from '@/lib/validators/address'

/**
 * GET /api/user/address
 * Get current user's primary address
 */
export async function GET() {
  try {
    const user = await requireAuth()

    const address = await getUserPrimaryAddress(user.id)

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'No address found' },
        { status: 404 }
      )
    }

    // Return address with city/state only (not full address for privacy)
    return NextResponse.json({
      success: true,
      data: {
        id: address.id,
        city: address.city,
        state: address.state,
        zip: address.zip,
        districtIds: address.districtIds,
        jurisdictionTags: address.jurisdictionTags,
      },
    })
  } catch (error) {
    console.error('GET /api/user/address error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch address' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/address
 * Add/update user address
 */
export async function POST(req: Request) {
  try {
    const user = await requireAuth()

    const body = await req.json()

    // Validate input
    const validation = addressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid address format',
          errors: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { address } = validation.data

    // Validate and store address
    const userAddress = await validateAndStoreAddress(user.id, address)

    return NextResponse.json({
      success: true,
      data: {
        id: userAddress.id,
        normalizedAddress: userAddress.normalizedAddress,
        city: userAddress.city,
        state: userAddress.state,
        zip: userAddress.zip,
        districtIds: userAddress.districtIds,
        confidence: userAddress.geocodeConfidence,
      },
    })
  } catch (error: any) {
    console.error('POST /api/user/address error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to validate address',
      },
      { status: 400 }
    )
  }
}
