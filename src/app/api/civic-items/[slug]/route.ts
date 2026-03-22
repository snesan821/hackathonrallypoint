import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/server'
import { errorResponse, successResponse } from '@/lib/api/middleware'
import { getCivicItemDetail } from '@/lib/civic/detail'

/**
 * GET /api/civic-items/[slug]
 * Get full civic item details by slug
 *
 * Records a VIEW engagement event for authenticated users (idempotent per session)
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const [{ slug }, user] = await Promise.all([params, getCurrentUser()])

    if (!slug) {
      return errorResponse('Slug parameter is required', 400)
    }

    const detail = await getCivicItemDetail(slug, user?.id)

    if (!detail) {
      return errorResponse('Civic item not found', 404)
    }

    return successResponse(detail)
  } catch (error: any) {
    console.error('GET /api/civic-items/[slug] error:', error)
    return errorResponse('Failed to fetch civic item details')
  }
}
