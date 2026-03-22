/**
 * Clean Low-Quality Civic Items Script
 * 
 * Analyzes civic items using a point-based scoring system and removes items
 * with poor quality summaries, vague headings, and minimal content.
 * 
 * Quality Scoring Criteria:
 * - Title quality (vague keywords, length, specificity)
 * - Summary quality (length, sentence count, detail level)
 * - Content completeness (has description, AI summary, etc.)
 * - Engagement metrics (views, saves, supports)
 */

import { prisma } from '../src/lib/db/prisma'

interface QualityScore {
  itemId: string
  slug: string
  title: string
  summary: string
  score: number
  reasons: string[]
  shouldDelete: boolean
}

// Vague/generic keywords that indicate low-quality titles
const VAGUE_KEYWORDS = [
  'fund', 'appropriation', 'certificate', 'grant', 'measure', 'policy',
  'program', 'initiative', 'proposal', 'plan', 'project', 'ordinance',
  'resolution', 'bill', 'act', 'law', 'regulation', 'rule', 'code',
  'water', 'property', 'health care', 'insurance', 'premium', 'dialysis',
  'multifamily', 'sustainability', 'conservation', 'education'
]

// Generic title patterns that indicate low quality
const VAGUE_PATTERNS = [
  /^[a-z\s]+;[a-z\s]+;[a-z\s]+$/i, // "word; word; word" pattern
  /^[a-z\s]+;[a-z\s]+$/i,          // "word; word" pattern
  /^\w+\s+\w+\s+(fund|grant|program|initiative)$/i, // "adjective noun fund/grant/etc"
]

/**
 * Calculate quality score for a civic item
 * Lower score = lower quality (should be deleted)
 * Higher score = higher quality (should be kept)
 */
function calculateQualityScore(item: any): QualityScore {
  let score = 100 // Start with perfect score
  const reasons: string[] = []

  // ===== TITLE QUALITY =====
  
  // Check for vague title patterns
  const hasVaguePattern = VAGUE_PATTERNS.some(pattern => pattern.test(item.title))
  if (hasVaguePattern) {
    score -= 30
    reasons.push('Title follows vague pattern (e.g., "word; word; word")')
  }

  // Check for excessive semicolons (indicates list-style title)
  const semicolonCount = (item.title.match(/;/g) || []).length
  if (semicolonCount >= 2) {
    score -= 20
    reasons.push(`Title has ${semicolonCount} semicolons (list-style)`)
  }

  // Check for vague keywords in title
  const titleLower = item.title.toLowerCase()
  const vagueTitleWords = VAGUE_KEYWORDS.filter(keyword => 
    titleLower.includes(keyword)
  )
  if (vagueTitleWords.length >= 3) {
    score -= 15
    reasons.push(`Title contains ${vagueTitleWords.length} vague keywords`)
  }

  // Check title length (too short = vague)
  if (item.title.length < 30) {
    score -= 10
    reasons.push(`Title too short (${item.title.length} chars)`)
  }

  // ===== SUMMARY QUALITY =====
  
  // Check summary length
  const summaryLength = item.summary.length
  if (summaryLength < 50) {
    score -= 40
    reasons.push(`Summary extremely short (${summaryLength} chars)`)
  } else if (summaryLength < 100) {
    score -= 25
    reasons.push(`Summary very short (${summaryLength} chars)`)
  } else if (summaryLength < 150) {
    score -= 10
    reasons.push(`Summary short (${summaryLength} chars)`)
  }

  // Check sentence count in summary
  const sentences = item.summary.split(/[.!?]+/).filter((s: string) => s.trim().length > 0)
  if (sentences.length === 1) {
    score -= 30
    reasons.push('Summary is only one sentence')
  } else if (sentences.length === 2) {
    score -= 15
    reasons.push('Summary is only two sentences')
  }

  // Check if summary is just a restatement of title
  const titleWords = new Set(item.title.toLowerCase().split(/\s+/))
  const summaryWords = item.summary.toLowerCase().split(/\s+/)
  const overlap = summaryWords.filter((word: string) => titleWords.has(word)).length
  const overlapPercent = (overlap / summaryWords.length) * 100
  if (overlapPercent > 70) {
    score -= 25
    reasons.push(`Summary ${overlapPercent.toFixed(0)}% overlap with title`)
  }

  // Check for generic summary phrases
  const genericPhrases = [
    'provides an appropriation',
    'concerns',
    'relates to',
    'a measure related to',
    'regarding',
    'pertaining to'
  ]
  const hasGenericPhrase = genericPhrases.some(phrase => 
    item.summary.toLowerCase().includes(phrase)
  )
  if (hasGenericPhrase) {
    score -= 15
    reasons.push('Summary uses generic phrases')
  }

  // ===== CONTENT COMPLETENESS =====
  
  // Check if has full description
  if (!item.fullDescription || item.fullDescription.length < 100) {
    score -= 10
    reasons.push('Missing or minimal full description')
  }

  // Check if has AI summary
  if (!item.aiSummary) {
    score -= 5
    reasons.push('No AI summary available')
  }

  // ===== ENGAGEMENT METRICS =====
  
  // Items with significant engagement should get a bonus
  const hasSignificantEngagement = item.currentSupport > 2 || 
                                    item._count.comments > 1 || 
                                    item._count.engagements > 10

  if (hasSignificantEngagement) {
    score += 20
    reasons.push('Has significant user engagement')
  }

  // ===== FINAL DECISION =====
  
  // Items with score below 40 should be deleted (even with minimal engagement)
  // Only protect items with significant engagement
  const shouldDelete = score < 40 && !hasSignificantEngagement

  return {
    itemId: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    score,
    reasons,
    shouldDelete
  }
}

async function analyzeAndCleanItems(dryRun: boolean = true) {
  console.log('🔍 Analyzing civic items for quality...\n')

  // Fetch all civic items with related data
  const items = await prisma.civicItem.findMany({
    include: {
      aiSummary: {
        select: {
          plainSummary: true,
        },
      },
      _count: {
        select: {
          comments: true,
          engagements: true,
        },
      },
    },
  })

  console.log(`📊 Total items in database: ${items.length}\n`)

  // Calculate quality scores
  const scores: QualityScore[] = items.map(calculateQualityScore)

  // Sort by score (lowest first)
  scores.sort((a, b) => a.score - b.score)

  // Separate items to delete and keep
  const itemsToDelete = scores.filter(s => s.shouldDelete)
  const itemsToKeep = scores.filter(s => !s.shouldDelete)

  console.log(`❌ Items to delete: ${itemsToDelete.length}`)
  console.log(`✅ Items to keep: ${itemsToKeep.length}\n`)

  // Display items to delete
  if (itemsToDelete.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 ITEMS TO DELETE (sorted by quality score)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    itemsToDelete.forEach((item, index) => {
      console.log(`${index + 1}. Score: ${item.score}/100`)
      console.log(`   Title: "${item.title}"`)
      console.log(`   Summary: "${item.summary.substring(0, 100)}${item.summary.length > 100 ? '...' : ''}"`)
      console.log(`   Slug: ${item.slug}`)
      console.log(`   Reasons:`)
      item.reasons.forEach(reason => console.log(`     - ${reason}`))
      console.log('')
    })
  }

  // Display low-quality items that will be kept (for review)
  const lowQualityKept = itemsToKeep.filter(s => s.score < 60)
  if (lowQualityKept.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  LOW-QUALITY ITEMS KEPT (have engagement or score >= 40)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    lowQualityKept.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. Score: ${item.score}/100`)
      console.log(`   Title: "${item.title}"`)
      console.log(`   Slug: ${item.slug}`)
      console.log(`   Reasons: ${item.reasons.join(', ')}`)
      console.log('')
    })

    if (lowQualityKept.length > 10) {
      console.log(`   ... and ${lowQualityKept.length - 10} more\n`)
    }
  }

  // Perform deletion if not dry run
  if (!dryRun && itemsToDelete.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🗑️  DELETING LOW-QUALITY ITEMS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const idsToDelete = itemsToDelete.map(item => item.itemId)

    // Delete related records first (cascade should handle this, but being explicit)
    await prisma.engagementEvent.deleteMany({
      where: { civicItemId: { in: idsToDelete } }
    })

    await prisma.comment.deleteMany({
      where: { civicItemId: { in: idsToDelete } }
    })

    // Delete the civic items
    const result = await prisma.civicItem.deleteMany({
      where: { id: { in: idsToDelete } }
    })

    console.log(`✅ Deleted ${result.count} civic items\n`)
  } else if (dryRun) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 DRY RUN MODE - No items were deleted')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Run with --execute flag to actually delete items')
    console.log('Example: tsx scripts/clean-low-quality-items.ts --execute\n')
  }

  // Summary statistics
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📈 SUMMARY STATISTICS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`Total items analyzed: ${items.length}`)
  console.log(`Items to delete: ${itemsToDelete.length} (${((itemsToDelete.length / items.length) * 100).toFixed(1)}%)`)
  console.log(`Items to keep: ${itemsToKeep.length} (${((itemsToKeep.length / items.length) * 100).toFixed(1)}%)`)
  console.log(`Low-quality items kept (engagement): ${lowQualityKept.length}`)
  
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
  console.log(`Average quality score: ${avgScore.toFixed(1)}/100`)
  
  const avgScoreAfter = itemsToKeep.reduce((sum, s) => sum + s.score, 0) / itemsToKeep.length
  console.log(`Average score after cleanup: ${avgScoreAfter.toFixed(1)}/100\n`)
}

// Main execution
const args = process.argv.slice(2)
const dryRun = !args.includes('--execute')

analyzeAndCleanItems(dryRun)
  .then(() => {
    console.log('✅ Analysis complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
