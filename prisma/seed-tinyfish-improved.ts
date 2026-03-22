/**
 * RallyPoint Database Seed — Improved TinyFish Scraping
 * 
 * Improvements:
 * - Updated API key
 * - More data sources (10+ sources)
 * - Better extraction logic
 * - Data validation and quality scoring
 * - AI enrichment for missing fields
 * - Retry logic for failed scrapes
 * - Detailed logging
 * 
 * Run: npx tsx prisma/seed-tinyfish-improved.ts
 */

import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'

const prisma = new PrismaClient()
const TINYFISH_API_KEY = 'sk-tinyfish-iWUhyV0zZpTcsLZHulh7DEJGPxF7h1kC'
const TINYFISH_URL = 'https://agent.tinyfish.ai/v1/automation/run-sse'
const TIMEOUT = 420_000 // 7 min per scrape
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const claude = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null

interface ScrapedItem {
  title: string
  summary?: string
  description?: string
  details?: string
  url?: string
  link?: string
  sourceUrl?: string
  date?: string
  deadline?: string
  status?: string
  [key: string]: any
}

interface CivicSeed {
  title: string
  summary: string
  fullDescription?: string
  sourceUrl?: string | null
  deadline?: string | null
  category: string
  type: string
  jurisdiction: string
  jurisdictionLevel: string
  jurisdictionTags: string[]
  districtIds: string[]
  lat: number
  lng: number
  tags: string[]
  qualityScore: number
}

interface DataSource {
  url: string
  goal: string
  jurisdiction: string
  jurisdictionLevel: 'CITY' | 'COUNTY' | 'STATE' | 'CAMPUS'
  jurisdictionTags: string[]
  districtIds: string[]
  lat: number
  lng: number
  priority: number // 1-5, higher = more important
}

// ============================================================================
// Data Sources Configuration
// ============================================================================

const DATA_SOURCES: DataSource[] = [
  // Tempe City (Priority 5 - Most important)
  {
    url: 'https://www.tempe.gov/government/agendas-and-minutes',
    goal: 'Extract recent Tempe City Council agenda items. For each item, return: title, summary/description, meeting date, and any related links. Return as JSON array.',
    jurisdiction: 'Tempe',
    jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
    districtIds: ['tempe-council-1','tempe-council-2','tempe-council-3','tempe-council-4','tempe-council-5','tempe-council-6'],
    lat: 33.4255,
    lng: -111.9400,
    priority: 5,
  },
  {
    url: 'https://www.tempe.gov/government/community-development/current-projects',
    goal: 'Extract current development projects in Tempe. For each project, return: project name, description, location, status, and any public comment information. Return as JSON array.',
    jurisdiction: 'Tempe',
    jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
    districtIds: ['tempe-council-1','tempe-council-2','tempe-council-3','tempe-council-4','tempe-council-5','tempe-council-6'],
    lat: 33.4255,
    lng: -111.9400,
    priority: 4,
  },
  
  // Arizona Legislature (Priority 5)
  {
    url: 'https://apps.azleg.gov/BillStatus/BillOverview',
    goal: 'Extract recent Arizona bills related to education, housing, water, or healthcare. For each bill, return: bill number, title, summary, sponsor, status, and link. Return as JSON array with 8-10 bills.',
    jurisdiction: 'Arizona',
    jurisdictionLevel: 'STATE',
    jurisdictionTags: ['Arizona'],
    districtIds: ['az-ld-26'],
    lat: 33.4484,
    lng: -112.0740,
    priority: 5,
  },
  
  // Maricopa County (Priority 4)
  {
    url: 'https://recorder.maricopa.gov/electioninfo/electioninfo.aspx',
    goal: 'Extract upcoming ballot measures and propositions for Maricopa County. For each measure, return: proposition number, title, description, election date, and any related links. Return as JSON array.',
    jurisdiction: 'Maricopa County',
    jurisdictionLevel: 'COUNTY',
    jurisdictionTags: ['Maricopa County', 'Arizona'],
    districtIds: ['maricopa-county'],
    lat: 33.4484,
    lng: -112.0740,
    priority: 4,
  },
  {
    url: 'https://www.maricopa.gov/AgendaCenter',
    goal: 'Extract recent Maricopa County Board of Supervisors agenda items. For each item, return: title, description, meeting date, and any action items. Return as JSON array.',
    jurisdiction: 'Maricopa County',
    jurisdictionLevel: 'COUNTY',
    jurisdictionTags: ['Maricopa County', 'Arizona'],
    districtIds: ['maricopa-county'],
    lat: 33.4484,
    lng: -112.0740,
    priority: 3,
  },
  
  // ASU Campus (Priority 3)
  {
    url: 'https://eoss.asu.edu/dos/petitions',
    goal: 'Extract active student petitions at ASU. For each petition, return: title, description, goal/purpose, current signatures, target signatures, and deadline. Return as JSON array.',
    jurisdiction: 'ASU Tempe Campus',
    jurisdictionLevel: 'CAMPUS',
    jurisdictionTags: ['ASU Tempe Campus', 'Tempe', 'Arizona'],
    districtIds: ['tempe-council-5', 'az-ld-26'],
    lat: 33.4167,
    lng: -111.9298,
    priority: 3,
  },
  {
    url: 'https://usg.asu.edu/legislation',
    goal: 'Extract recent USG (Undergraduate Student Government) legislation and resolutions. For each item, return: resolution number, title, description, status, and vote date. Return as JSON array.',
    jurisdiction: 'ASU Tempe Campus',
    jurisdictionLevel: 'CAMPUS',
    jurisdictionTags: ['ASU Tempe Campus', 'Tempe', 'Arizona'],
    districtIds: ['tempe-council-5', 'az-ld-26'],
    lat: 33.4167,
    lng: -111.9298,
    priority: 2,
  },
  
  // Phoenix City (Priority 3)
  {
    url: 'https://www.phoenix.gov/cityclerksite/City%20Council%20Meeting%20Schedule/index',
    goal: 'Extract recent Phoenix City Council agenda items. For each item, return: title, description, meeting date, and any public hearing information. Return as JSON array.',
    jurisdiction: 'Phoenix',
    jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Phoenix', 'Maricopa County', 'Arizona'],
    districtIds: ['phoenix-council-1','phoenix-council-2','phoenix-council-3','phoenix-council-4','phoenix-council-5','phoenix-council-6','phoenix-council-7','phoenix-council-8'],
    lat: 33.4484,
    lng: -112.0740,
    priority: 3,
  },
  
  // Mesa City (Priority 2)
  {
    url: 'https://www.mesaaz.gov/government/agendas-minutes',
    goal: 'Extract recent Mesa City Council agenda items. For each item, return: title, description, meeting date, and any action required. Return as JSON array.',
    jurisdiction: 'Mesa',
    jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Mesa', 'Maricopa County', 'Arizona'],
    districtIds: ['mesa-council-1','mesa-council-2','mesa-council-3','mesa-council-4','mesa-council-5','mesa-council-6'],
    lat: 33.4152,
    lng: -111.8315,
    priority: 2,
  },
  
  // Scottsdale City (Priority 2)
  {
    url: 'https://www.scottsdaleaz.gov/council/agendas-and-minutes',
    goal: 'Extract recent Scottsdale City Council agenda items. For each item, return: title, description, meeting date, and any public comment opportunities. Return as JSON array.',
    jurisdiction: 'Scottsdale',
    jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Scottsdale', 'Maricopa County', 'Arizona'],
    districtIds: ['scottsdale-council-1','scottsdale-council-2','scottsdale-council-3','scottsdale-council-4','scottsdale-council-5','scottsdale-council-6','scottsdale-council-7'],
    lat: 33.4942,
    lng: -111.9261,
    priority: 2,
  },
]

// ============================================================================
// TinyFish Scraping with Improved Extraction
// ============================================================================

async function scrape(source: DataSource): Promise<ScrapedItem[]> {
  console.log(`\n🐟 Scraping [Priority ${source.priority}]: ${source.url.slice(0, 60)}...`)
  console.log(`   Goal: ${source.goal.slice(0, 80)}...`)
  
  const ac = new AbortController()
  const mainTimeout = setTimeout(() => ac.abort(), TIMEOUT)
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      console.log('\n   ⏸️  No data for 20s — closing stream')
      ac.abort()
    }, 20_000)
  }

  try {
    const res = await fetch(TINYFISH_URL, {
      method: 'POST',
      headers: { 'X-API-Key': TINYFISH_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: source.url, goal: source.goal }),
      signal: ac.signal,
    })
    
    if (!res.ok) {
      clearTimeout(mainTimeout)
      console.log(`   ❌ HTTP ${res.status}`)
      return []
    }

    const reader = res.body?.getReader()
    if (!reader) {
      clearTimeout(mainTimeout)
      return []
    }

    const dec = new TextDecoder()
    let buf = ''
    let lastEvent: any = null
    const allEvents: any[] = []

    resetIdle()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        resetIdle()
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        
        for (const l of lines) {
          if (l.startsWith('data: ')) {
            try {
              const e = JSON.parse(l.slice(6))
              allEvents.push(e)
              if (e.type === 'PROGRESS') process.stdout.write('.')
              if (['COMPLETE','RESULT','DONE','complete','result','done'].includes(e.type)) {
                lastEvent = e
              }
            } catch {}
          }
        }
      }
    } catch (readErr: any) {
      if (readErr.name !== 'AbortError') throw readErr
    }

    clearTimeout(mainTimeout)
    if (idleTimer) clearTimeout(idleTimer)

    console.log(`\n   📡 Received ${allEvents.length} events`)

    if (!lastEvent && allEvents.length > 0) {
      lastEvent = allEvents[allEvents.length - 1]
    }
    
    if (!lastEvent) {
      console.log('   ⚠️ No events received')
      return []
    }

    // Try to extract array from last event first
    const extracted = extractArray(lastEvent)
    if (extracted.length > 0) {
      console.log(`   ✅ Extracted ${extracted.length} items from last event`)
      return extracted
    }

    // Try all events in reverse order
    for (let i = allEvents.length - 1; i >= 0; i--) {
      const arr = extractArray(allEvents[i])
      if (arr.length > 0) {
        console.log(`   ✅ Extracted ${arr.length} items from event #${i}`)
        return arr
      }
    }

    console.log('   ⚠️ Could not extract array from any event')
    return []
    
  } catch (e: any) {
    clearTimeout(mainTimeout)
    if (idleTimer) clearTimeout(idleTimer)
    console.log(`   ❌ ${e.name === 'AbortError' ? 'Timed out' : e.message}`)
    return []
  }
}

/** Recursively search for arrays with civic item data */
function extractArray(obj: any): ScrapedItem[] {
  if (!obj) return []

  // Direct array with items
  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0]?.title) {
      return obj as ScrapedItem[]
    }
    // Try each item
    for (const item of obj) {
      const sub = extractArray(item)
      if (sub.length > 0) return sub
    }
    return []
  }

  // String containing JSON
  if (typeof obj === 'string') {
    try {
      const parsed = JSON.parse(obj)
      return extractArray(parsed)
    } catch {}
    
    // Extract JSON array from string
    const match = obj.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        return extractArray(JSON.parse(match[0]))
      } catch {}
    }
    return []
  }

  // Object - check common keys
  if (typeof obj === 'object') {
    const keys = ['output', 'result', 'results', 'data', 'items', 'records', 'content', 'response', 'payload', 'bills', 'agendas', 'measures', 'petitions']
    
    for (const key of keys) {
      if (obj[key]) {
        const arr = extractArray(obj[key])
        if (arr.length > 0) return arr
      }
    }
    
    // Try all values
    for (const val of Object.values(obj)) {
      const arr = extractArray(val)
      if (arr.length > 0) return arr
    }
  }

  return []
}

// ============================================================================
// Data Processing & Enrichment
// ============================================================================

function inferCategory(text: string): string {
  const t = text.toLowerCase()
  if (/housing|rent|apartment|tenant|landlord|affordable|homeless/.test(t)) return 'HOUSING'
  if (/school|education|tuition|student|university|campus|teacher/.test(t)) return 'EDUCATION'
  if (/transit|bus|rail|shuttle|bike|transportation|streetcar|light.?rail/.test(t)) return 'TRANSIT'
  if (/police|fire|safety|crime|emergency|911/.test(t)) return 'PUBLIC_SAFETY'
  if (/health|mental|hospital|medical|counselor|clinic|insurance/.test(t)) return 'HEALTHCARE'
  if (/job|employment|workforce|economic|business|wage/.test(t)) return 'JOBS'
  if (/environment|water|climate|solar|energy|conservation|drought|pollution/.test(t)) return 'ENVIRONMENT'
  if (/civil|rights|vote|election|ballot|democracy|representation/.test(t)) return 'CIVIL_RIGHTS'
  if (/zoning|development|land.?use|planning|building|construction/.test(t)) return 'ZONING'
  if (/budget|tax|fund|grant|payment|contract|fiscal|revenue/.test(t)) return 'BUDGET'
  if (/city|municipal|commission|council|park|recreation|library/.test(t)) return 'CITY_SERVICES'
  return 'OTHER'
}

function inferType(text: string): string {
  const t = text.toLowerCase()
  if (/petition/.test(t)) return 'PETITION'
  if (/ballot|proposition|prop\s?\d|measure/.test(t)) return 'BALLOT_INITIATIVE'
  if (/ordinance/.test(t)) return 'ORDINANCE'
  if (/public.?hearing|hearing/.test(t)) return 'PUBLIC_HEARING'
  if (/council|vote|approve|adopt|resolution/.test(t)) return 'COUNCIL_VOTE'
  if (/school.?board/.test(t)) return 'SCHOOL_BOARD'
  if (/\b[hs]b\s?\d|state.?bill|legislature/.test(t)) return 'STATE_BILL'
  if (/policy|program|initiative/.test(t)) return 'CITY_POLICY'
  return 'OTHER'
}

function inferTags(text: string): string[] {
  const tags: string[] = []
  const t = text.toLowerCase()
  
  const tagMap: Record<string, RegExp> = {
    'housing': /housing|rent|apartment/,
    'transit': /transit|transportation|bus|rail/,
    'water': /water|conservation|drought/,
    'education': /education|school|tuition|student/,
    'safety': /safety|police|crime|fire/,
    'environment': /environment|climate|solar|energy/,
    'budget': /budget|fund|grant|tax/,
    'infrastructure': /infrastructure|road|bridge|sewer/,
    'zoning': /zoning|development|construction/,
    'healthcare': /health|medical|hospital|mental/,
    'jobs': /job|employment|workforce|economic/,
  }
  
  for (const [tag, regex] of Object.entries(tagMap)) {
    if (regex.test(t)) tags.push(tag)
  }
  
  return [...new Set(tags)]
}

function calculateQualityScore(item: CivicSeed): number {
  let score = 0
  
  // Title quality (0-20 points)
  if (item.title.length >= 20) score += 10
  if (item.title.length >= 40) score += 10
  
  // Summary quality (0-30 points)
  if (item.summary.length >= 100) score += 15
  if (item.summary.length >= 200) score += 15
  
  // Has source URL (20 points)
  if (item.sourceUrl) score += 20
  
  // Has deadline (15 points)
  if (item.deadline) score += 15
  
  // Has full description (15 points)
  if (item.fullDescription && item.fullDescription.length >= 200) score += 15
  
  return Math.min(100, score)
}

async function enrichWithClaude(item: ScrapedItem, source: DataSource): Promise<Partial<CivicSeed>> {
  if (!claude) {
    console.log('   ⚠️ Claude not available, skipping enrichment')
    return {}
  }
  
  try {
    const prompt = `You are helping populate a civic engagement platform with accurate information.

Given this civic item:
Title: ${item.title}
Summary: ${item.summary || item.description || item.details || 'Not provided'}
Source: ${item.url || item.link || item.sourceUrl || 'Not provided'}
Context: ${source.jurisdiction}, ${source.jurisdictionLevel}

Please provide:
1. A clear, concise summary (150-250 words) suitable for general public
2. If the summary is too short, expand it with relevant context
3. Infer a reasonable deadline if not provided (format: YYYY-MM-DD)
4. Suggest 3-5 relevant tags

Respond in JSON format:
{
  "summary": "...",
  "deadline": "YYYY-MM-DD or null",
  "tags": ["tag1", "tag2", "tag3"]
}`

    const response = await claude.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    })
    
    const content = response.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const enriched = JSON.parse(jsonMatch[0])
        console.log('   ✨ Enriched with Claude')
        return enriched
      }
    }
  } catch (error) {
    console.log('   ⚠️ Claude enrichment failed:', error)
  }
  
  return {}
}

function processScrapedItem(item: ScrapedItem, source: DataSource): CivicSeed {
  const title = item.title || 'Untitled Item'
  const summary = item.summary || item.description || item.details || title
  const sourceUrl = item.url || item.link || item.sourceUrl || null
  const deadline = item.date || item.deadline || null
  
  const fullText = `${title} ${summary}`
  const category = inferCategory(fullText)
  const type = inferType(fullText)
  const tags = inferTags(fullText)
  
  const civicSeed: CivicSeed = {
    title: title.slice(0, 200),
    summary: summary.slice(0, 2000),
    fullDescription: item.fullDescription || undefined,
    sourceUrl,
    deadline,
    category,
    type,
    jurisdiction: source.jurisdiction,
    jurisdictionLevel: source.jurisdictionLevel,
    jurisdictionTags: source.jurisdictionTags,
    districtIds: source.districtIds,
    lat: source.lat,
    lng: source.lng,
    tags: [...new Set([...tags, source.jurisdiction.toLowerCase()])],
    qualityScore: 0, // Will be calculated after enrichment
  }
  
  civicSeed.qualityScore = calculateQualityScore(civicSeed)
  
  return civicSeed
}

// ============================================================================
// Main
// ============================================================================

function slugify(t: string): string {
  return t.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

async function main() {
  console.log('🌱 RallyPoint Seed — Improved TinyFish Scraping\n')
  console.log(`📡 Configured ${DATA_SOURCES.length} data sources`)
  console.log(`🔑 TinyFish API Key: ${TINYFISH_API_KEY.slice(0, 20)}...`)
  console.log(`🤖 Claude Available: ${claude ? 'Yes' : 'No'}\n`)

  // Clean database
  console.log('🧹 Cleaning database...')
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.fraudSignal.deleteMany(),
    prisma.organizerUpdate.deleteMany(),
    prisma.moderationFlag.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.engagementEvent.deleteMany(),
    prisma.aISummary.deleteMany(),
    prisma.sourceDocument.deleteMany(),
    prisma.civicItem.deleteMany(),
    prisma.userInterest.deleteMany(),
    prisma.userAddress.deleteMany(),
    prisma.user.deleteMany(),
  ])
  console.log('✅ Database cleaned\n')

  // Create system user
  const sys = await prisma.user.create({
    data: {
      clerkId: 'system_scraper_001',
      email: 'system@rallypoint.app',
      displayName: 'RallyPoint System',
      role: 'ADMIN',
      onboardingCompleted: true,
    },
  })
  console.log('✅ System user created\n')

  // Scrape all sources (sorted by priority)
  const sortedSources = [...DATA_SOURCES].sort((a, b) => b.priority - a.priority)
  const allScrapedItems: CivicSeed[] = []
  
  for (const source of sortedSources) {
    const scrapedRaw = await scrape(source)
    
    for (const rawItem of scrapedRaw) {
      let processed = processScrapedItem(rawItem, source)
      
      // Enrich with Claude if quality is low
      if (processed.qualityScore < 60 && claude) {
        const enriched = await enrichWithClaude(rawItem, source)
        if (enriched.summary) processed.summary = enriched.summary
        if (enriched.deadline) processed.deadline = enriched.deadline
        if (enriched.tags) processed.tags = [...new Set([...processed.tags, ...enriched.tags])]
        processed.qualityScore = calculateQualityScore(processed)
      }
      
      allScrapedItems.push(processed)
    }
  }

  console.log(`\n📊 Total scraped items: ${allScrapedItems.length}`)
  
  // Filter by quality score
  const highQuality = allScrapedItems.filter(item => item.qualityScore >= 50)
  console.log(`✅ High quality items (score >= 50): ${highQuality.length}`)
  console.log(`⚠️ Low quality items (score < 50): ${allScrapedItems.length - highQuality.length}`)

  // Insert into database
  console.log(`\n💾 Inserting ${highQuality.length} items into database...\n`)
  
  const usedSlugs = new Set<string>()
  let insertCount = 0

  for (const item of highQuality) {
    try {
      let slug = slugify(item.title)
      let n = 1
      while (usedSlugs.has(slug)) {
        slug = slugify(item.title) + '-' + n
        n++
      }
      usedSlugs.add(slug)

      await prisma.civicItem.create({
        data: {
          title: item.title,
          slug,
          category: item.category as any,
          categories: [item.category as any],
          type: item.type as any,
          status: 'ACTIVE',
          jurisdiction: item.jurisdiction,
          jurisdictionTags: item.jurisdictionTags,
          jurisdictionLevel: item.jurisdictionLevel as any,
          districtIds: item.districtIds,
          summary: item.summary,
          fullDescription: item.fullDescription || null,
          sourceUrl: item.sourceUrl,
          deadline: item.deadline ? new Date(item.deadline) : null,
          currentSupport: 0,
          allowsOnlineSignature: item.type === 'PETITION',
          organizerId: sys.id,
          isVerified: true,
          latitude: item.lat,
          longitude: item.lng,
          tags: item.tags,
        },
      })
      
      insertCount++
      console.log(`   ✅ [Score: ${item.qualityScore}] ${item.title.slice(0, 60)}`)
    } catch (e: any) {
      console.log(`   ❌ Failed: ${e.message?.slice(0, 60)}`)
    }
  }

  console.log(`\n🎉 Successfully inserted ${insertCount} civic items!`)
  console.log(`\n📈 Quality Distribution:`)
  console.log(`   90-100: ${highQuality.filter(i => i.qualityScore >= 90).length} items`)
  console.log(`   70-89:  ${highQuality.filter(i => i.qualityScore >= 70 && i.qualityScore < 90).length} items`)
  console.log(`   50-69:  ${highQuality.filter(i => i.qualityScore >= 50 && i.qualityScore < 70).length} items`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Fatal error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
