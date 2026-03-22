import { NextResponse } from 'next/server'
import { reverseGeocode } from '@/lib/geo/geocode'

/**
 * POST /api/user/location
 * Reverse geocode browser coordinates to city/state.
 * No auth required — this is a lightweight lookup.
 */
export async function POST(req: Request) {
  try {
    const { latitude, longitude } = await req.json()

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    const result = await reverseGeocode(latitude, longitude)

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Could not determine location' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        city: result.city,
        state: result.state,
        zip: result.zip,
        county: result.county,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Location lookup failed' },
      { status: 500 }
    )
  }
}
