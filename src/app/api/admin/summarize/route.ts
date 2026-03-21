import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/server'
import { processSummarizationJob, batchProcessSummarizations } from '@/lib/ai/jobs'
import { z } from 'zod'

/**
 * Request validation schema
 */
const summarizeRequestSchema = z.object({
  sourceDocumentId: z.string().uuid('Invalid source document ID'),
})

const batchSummarizeRequestSchema = z.object({
  sourceDocumentIds: z.array(z.string().uuid()).min(1, 'At least one document ID required'),
})

/**
 * POST /api/admin/summarize
 * Trigger AI summarization for a source document
 *
 * Requires: ORGANIZER or ADMIN role
 */
export async function POST(req: Request) {
  try {
    // Require ORGANIZER or ADMIN role
    await requireRole(['ORGANIZER', 'ADMIN'])

    const body = await req.json()

    // Check if this is a batch request
    const isBatchRequest = Array.isArray(body.sourceDocumentIds)

    if (isBatchRequest) {
      // Validate batch request
      const validation = batchSummarizeRequestSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request format',
            errors: validation.error.errors,
          },
          { status: 400 }
        )
      }

      const { sourceDocumentIds } = validation.data

      console.log(
        `Starting batch summarization for ${sourceDocumentIds.length} documents...`
      )

      // Process batch (runs synchronously in MVP)
      // TODO: In production, queue these as separate background jobs
      const results = await batchProcessSummarizations(sourceDocumentIds)

      return NextResponse.json({
        success: true,
        data: {
          status: 'completed',
          processedCount: sourceDocumentIds.length,
          successful: results.successful.length,
          failed: results.failed.length,
          results,
        },
      })
    } else {
      // Single document request
      const validation = summarizeRequestSchema.safeParse(body)

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request format',
            errors: validation.error.errors,
          },
          { status: 400 }
        )
      }

      const { sourceDocumentId } = validation.data

      console.log(`Starting summarization job for document ${sourceDocumentId}...`)

      // Process summarization job (runs synchronously in MVP)
      // TODO: In production, queue this as a background job and return job ID
      const aiSummary = await processSummarizationJob(sourceDocumentId)

      return NextResponse.json({
        success: true,
        data: {
          status: 'completed',
          sourceDocumentId,
          aiSummaryId: aiSummary.id,
          summary: {
            plainSummary: aiSummary.plainSummary,
            categories: aiSummary.categories,
            affectedJurisdictions: aiSummary.affectedJurisdictions,
          },
        },
      })
    }
  } catch (error: any) {
    console.error('POST /api/admin/summarize error:', error)

    // Handle specific error types
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: This endpoint requires ORGANIZER or ADMIN role',
        },
        { status: 403 }
      )
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      )
    }

    if (error.message?.includes('no text content')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process summarization job',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/summarize/pending
 * Get all source documents that need summarization
 *
 * Requires: ORGANIZER or ADMIN role
 */
export async function GET() {
  try {
    await requireRole(['ORGANIZER', 'ADMIN'])

    const { prisma } = await import('@/lib/db/prisma')

    // Find all documents that haven't been processed yet
    const pendingDocuments = await prisma.sourceDocument.findMany({
      where: {
        processingStatus: 'PENDING',
      },
      include: {
        civicItem: {
          select: {
            id: true,
            title: true,
            type: true,
            jurisdictionTags: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        count: pendingDocuments.length,
        documents: pendingDocuments.map((doc) => ({
          id: doc.id,
          civicItemId: doc.civicItemId,
          civicItemTitle: doc.civicItem.title,
          civicItemType: doc.civicItem.type,
          uploadedAt: doc.uploadedAt,
          fileSize: doc.fullText?.length || 0,
        })),
      },
    })
  } catch (error: any) {
    console.error('GET /api/admin/summarize/pending error:', error)

    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: This endpoint requires ORGANIZER or ADMIN role',
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending documents' },
      { status: 500 }
    )
  }
}
