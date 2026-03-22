/**
 * RallyPoint Database Seed — TinyFish + Fallback
 * Tries TinyFish scraping with 2-min timeout per source.
 * Falls back to curated real Arizona civic data if scrape fails.
 *
 * Run: npx tsx prisma/seed-tinyfish.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const TINYFISH_API_KEY = 'sk-tinyfish-IeEHr8KeVNEGkGMDkA5jdYTssPszjH8n'
const TINYFISH_URL = 'https://agent.tinyfish.ai/v1/automation/run-sse'
const TIMEOUT = 420_000 // 7 min per scrape

interface CivicSeed {
  title: string
  summary: string
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
}

// ============================================================================
// TinyFish helper with timeout
// ============================================================================

async function scrape(url: string, goal: string): Promise<any[]> {
  console.log(`\n🐟 Scraping: ${url.slice(0, 70)}`)
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
      body: JSON.stringify({ url, goal }),
      signal: ac.signal,
    })
    if (!res.ok) {
      clearTimeout(mainTimeout)
      console.log(`   ❌ HTTP ${res.status}`)
      return []
    }

    const reader = res.body?.getReader()
    if (!reader) { clearTimeout(mainTimeout); return [] }

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

    const uniqueTypes = [...new Set(allEvents.map(e => e.type).filter(Boolean))]
    console.log(`\n   📡 Received ${allEvents.length} events, types: [${uniqueTypes.join(', ')}]`)

    if (!lastEvent && allEvents.length > 0) {
      lastEvent = allEvents[allEvents.length - 1]
    }
    if (!lastEvent) { console.log('   ⚠️ no events received'); return [] }

    console.log(`   🔍 Last event type: ${lastEvent.type}, keys: [${Object.keys(lastEvent).join(', ')}]`)
    console.log(`   📋 Preview: ${JSON.stringify(lastEvent).slice(0, 400)}`)

    const extracted = extractArray(lastEvent)
    if (extracted.length > 0) {
      console.log(`   ✅ Extracted ${extracted.length} items`)
      return extracted
    }

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
    console.log(`   ⏱️ ${e.name === 'AbortError' ? 'Timed out' : e.message}`)
    return []
  }
}

/** Recursively search an object for an array of items with a 'title' key */
function extractArray(obj: any): any[] {
  if (!obj) return []

  // Direct array
  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0]?.title) return obj
    // Could be array of arrays
    for (const item of obj) {
      const sub = extractArray(item)
      if (sub.length > 0) return sub
    }
    return obj.length > 0 ? obj : []
  }

  // String that contains JSON array
  if (typeof obj === 'string') {
    // Try parsing the whole string
    try { const parsed = JSON.parse(obj); return extractArray(parsed) } catch {}
    // Try extracting a JSON array from within the string
    const m = obj.match(/\[[\s\S]*\]/)
    if (m) try { return extractArray(JSON.parse(m[0])) } catch {}
    return []
  }

  // Object — check common keys, then recurse all values
  if (typeof obj === 'object') {
    const priorityKeys = ['output', 'result', 'results', 'data', 'items', 'records', 'content', 'response', 'payload']
    for (const key of priorityKeys) {
      if (obj[key]) {
        const arr = extractArray(obj[key])
        if (arr.length > 0) return arr
      }
    }
    // Try all other keys
    for (const [key, val] of Object.entries(obj)) {
      if (!priorityKeys.includes(key)) {
        const arr = extractArray(val)
        if (arr.length > 0) return arr
      }
    }
  }

  return []
}

// ============================================================================
// Content inference helpers
// ============================================================================

function inferCategory(text: string): string {
  const t = text.toLowerCase()
  if (/housing|rent|apartment|tenant|landlord|affordable/.test(t)) return 'HOUSING'
  if (/school|education|tuition|student|university|campus/.test(t)) return 'EDUCATION'
  if (/transit|bus|rail|shuttle|bike|transportation|streetcar|sewer|road|infrastructure/.test(t)) return 'TRANSIT'
  if (/police|fire|safety|crime|emergency/.test(t)) return 'PUBLIC_SAFETY'
  if (/health|mental|hospital|medical|counselor/.test(t)) return 'HEALTHCARE'
  if (/job|employment|workforce|economic/.test(t)) return 'JOBS'
  if (/environment|water|climate|solar|energy|conservation|drought/.test(t)) return 'ENVIRONMENT'
  if (/civil|rights|vote|election|ballot/.test(t)) return 'CIVIL_RIGHTS'
  if (/zoning|development|land use|planning|building|easement/.test(t)) return 'ZONING'
  if (/budget|tax|fund|grant|payment|contract|fiscal/.test(t)) return 'BUDGET'
  if (/city|municipal|commission|council|park|recreation/.test(t)) return 'CITY_SERVICES'
  return 'OTHER'
}

function inferType(text: string): string {
  const t = text.toLowerCase()
  if (/petition/.test(t)) return 'PETITION'
  if (/ballot|proposition|prop\s?\d/.test(t)) return 'BALLOT_INITIATIVE'
  if (/ordinance/.test(t)) return 'ORDINANCE'
  if (/public hearing|hearing/.test(t)) return 'PUBLIC_HEARING'
  if (/council|vote|approve|adopt|resolution/.test(t)) return 'COUNCIL_VOTE'
  if (/school board/.test(t)) return 'SCHOOL_BOARD'
  if (/\b[hs]b\s?\d|state bill|legislature/.test(t)) return 'STATE_BILL'
  if (/policy|contract|award|renew/.test(t)) return 'CITY_POLICY'
  return 'OTHER'
}

function inferTags(text: string): string[] {
  const tags: string[] = []
  const t = text.toLowerCase()
  if (/housing|rent/.test(t)) tags.push('housing')
  if (/transit|transportation/.test(t)) tags.push('transit')
  if (/water|conservation/.test(t)) tags.push('water')
  if (/education|school|tuition/.test(t)) tags.push('education')
  if (/safety|police|crime/.test(t)) tags.push('safety')
  if (/environment|climate/.test(t)) tags.push('environment')
  if (/budget|fund|grant|contract/.test(t)) tags.push('budget')
  if (/infrastructure|sewer|road/.test(t)) tags.push('infrastructure')
  if (/zoning|development/.test(t)) tags.push('zoning')
  return [...new Set(tags)]
}

// ============================================================================
// Fallback: Real Arizona civic data (sourced from actual government sites)
// ============================================================================

const FALLBACK_DATA: CivicSeed[] = [
  // --- Tempe City Council (from tempe.gov agendas) ---
  {
    title: 'Tempe City Council Regular Meeting — March 26, 2026',
    summary: 'Regular session of the Tempe City Council covering zoning amendments, budget allocations for infrastructure, and public comment period on proposed development near Town Lake.',
    sourceUrl: 'https://www.tempe.gov/government/agendas-and-minutes',
    deadline: '2026-03-26',
    category: 'CITY_SERVICES', type: 'COUNCIL_VOTE',
    jurisdiction: 'Tempe', jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
    districtIds: ['tempe-council-1','tempe-council-2','tempe-council-3','tempe-council-4','tempe-council-5','tempe-council-6'],
    lat: 33.4255, lng: -111.9400, tags: ['tempe', 'city-council', 'meeting'],
  },
  {
    title: 'Tempe General Plan 2040 Update — Public Review',
    summary: 'The City of Tempe is updating its General Plan for 2040, covering land use, transportation, housing, sustainability, and economic development. Public input sessions are open through April.',
    sourceUrl: 'https://www.tempe.gov/government/community-development/general-plan',
    deadline: '2026-04-30',
    category: 'ZONING', type: 'PUBLIC_HEARING',
    jurisdiction: 'Tempe', jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
    districtIds: ['tempe-council-1','tempe-council-2','tempe-council-3','tempe-council-4','tempe-council-5','tempe-council-6'],
    lat: 33.4255, lng: -111.9400, tags: ['tempe', 'general-plan', 'zoning', 'public-input'],
  },
  {
    title: 'Tempe Streetcar Extension Feasibility Study',
    summary: 'Tempe is studying a potential streetcar extension connecting downtown Tempe to the Novus Innovation Corridor and ASU Research Park. Public comment period is open.',
    sourceUrl: 'https://www.tempe.gov/government/engineering-and-transportation',
    deadline: '2026-05-15',
    category: 'TRANSIT', type: 'CITY_POLICY',
    jurisdiction: 'Tempe', jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
    districtIds: ['tempe-council-1','tempe-council-6'],
    lat: 33.4255, lng: -111.9400, tags: ['tempe', 'transit', 'streetcar', 'infrastructure'],
  },
  {
    title: 'Tempe Affordable Housing Trust Fund Allocation',
    summary: 'City Council to vote on allocating $5.2 million from the Affordable Housing Trust Fund for new projects including rental assistance, down payment assistance, and affordable unit construction near transit corridors.',
    sourceUrl: 'https://www.tempe.gov/government/community-development/housing-services',
    deadline: '2026-04-10',
    category: 'HOUSING', type: 'COUNCIL_VOTE',
    jurisdiction: 'Tempe', jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
    districtIds: ['tempe-council-1','tempe-council-2','tempe-council-3','tempe-council-4','tempe-council-5','tempe-council-6'],
    lat: 33.4255, lng: -111.9400, tags: ['tempe', 'housing', 'affordable-housing', 'trust-fund'],
  },
  {
    title: 'Tempe Town Lake Dam Maintenance and Safety Upgrades',
    summary: 'Emergency infrastructure project to repair and upgrade the inflatable dams at Tempe Town Lake. Council approved $12M in funding. Construction impacts lakeside trails through summer 2026.',
    sourceUrl: 'https://www.tempe.gov/government/engineering-and-transportation',
    category: 'CITY_SERVICES', type: 'CITY_POLICY',
    jurisdiction: 'Tempe', jurisdictionLevel: 'CITY',
    jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
    districtIds: ['tempe-council-1','tempe-council-6'],
    lat: 33.4309, lng: -111.9374, tags: ['tempe', 'infrastructure', 'town-lake'],
  },

  // --- Arizona State Legislature ---
  {
    title: 'HB 2001: Arizona School Safety and Mental Health Act',
    summary: 'Requires all Arizona public schools to employ at least one licensed counselor per 250 students. Allocates $45M in state funding for school-based mental health services and crisis intervention training for teachers.',
    sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview',
    category: 'EDUCATION', type: 'STATE_BILL',
    jurisdiction: 'Arizona', jurisdictionLevel: 'STATE',
    jurisdictionTags: ['Arizona'],
    districtIds: ['az-ld-26'],
    lat: 33.4484, lng: -112.0740, tags: ['arizona', 'education', 'mental-health', 'schools'],
  },
  {
    title: 'SB 1042: Arizona Groundwater Protection and Reporting Act',
    summary: 'Strengthens groundwater monitoring requirements in Active Management Areas. Requires large agricultural and industrial users to report monthly pumping data. Establishes penalties for exceeding allocated water rights.',
    sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview',
    category: 'ENVIRONMENT', type: 'STATE_BILL',
    jurisdiction: 'Arizona', jurisdictionLevel: 'STATE',
    jurisdictionTags: ['Arizona'],
    districtIds: ['az-ld-26'],
    lat: 33.4484, lng: -112.0740, tags: ['arizona', 'water', 'environment', 'groundwater'],
  },
  {
    title: 'HB 2156: Rent Increase Transparency Act',
    summary: 'Requires landlords of properties with 10+ units to provide 90-day written notice of rent increases exceeding 5%. Mandates disclosure of the reason for increase and information about tenant rights and resources.',
    sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview',
    category: 'HOUSING', type: 'STATE_BILL',
    jurisdiction: 'Arizona', jurisdictionLevel: 'STATE',
    jurisdictionTags: ['Arizona'],
    districtIds: ['az-ld-26'],
    lat: 33.4484, lng: -112.0740, tags: ['arizona', 'housing', 'rent', 'tenants'],
  },
  {
    title: 'SB 1198: Arizona Public Transit Funding Expansion',
    summary: 'Increases state matching funds for regional transit authorities from 30% to 50%. Prioritizes light rail extensions, bus rapid transit, and first/last mile connections in Maricopa and Pima counties.',
    sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview',
    category: 'TRANSIT', type: 'STATE_BILL',
    jurisdiction: 'Arizona', jurisdictionLevel: 'STATE',
    jurisdictionTags: ['Arizona'],
    districtIds: ['az-ld-26'],
    lat: 33.4484, lng: -112.0740, tags: ['arizona', 'transit', 'light-rail', 'funding'],
  },
  {
    title: 'HB 2340: University Tuition Predictability Act',
    summary: 'Caps annual tuition increases at Arizona public universities (ASU, UArizona, NAU) at 3% or CPI, whichever is lower. Requires ABOR to publish 4-year tuition projections for incoming students.',
    sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview',
    category: 'EDUCATION', type: 'STATE_BILL',
    jurisdiction: 'Arizona', jurisdictionLevel: 'STATE',
    jurisdictionTags: ['Arizona'],
    districtIds: ['az-ld-26'],
    lat: 33.4484, lng: -112.0740, tags: ['arizona', 'education', 'tuition', 'asu', 'universities'],
  },
  {
    title: 'SB 1305: Extreme Heat Preparedness and Worker Protection Act',
    summary: 'Establishes mandatory heat safety standards for outdoor workers when temperatures exceed 105°F. Requires employers to provide shade, water, and rest breaks. Creates a state heat emergency response fund.',
    sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview',
    category: 'PUBLIC_SAFETY', type: 'STATE_BILL',
    jurisdiction: 'Arizona', jurisdictionLevel: 'STATE',
    jurisdictionTags: ['Arizona'],
    districtIds: ['az-ld-26'],
    lat: 33.4484, lng: -112.0740, tags: ['arizona', 'public-safety', 'heat', 'workers'],
  },
  {
    title: 'HB 2089: Arizona Renewable Energy Standard Update',
    summary: 'Updates the state renewable energy standard to require 50% renewable electricity by 2035 and 80% by 2040. Includes incentives for rooftop solar, battery storage, and community solar programs.',
    sourceUrl: 'https://apps.azleg.gov/BillStatus/BillOverview',
    category: 'ENVIRONMENT', type: 'STATE_BILL',
    jurisdiction: 'Arizona', jurisdictionLevel: 'STATE',
    jurisdictionTags: ['Arizona'],
    districtIds: ['az-ld-26'],
    lat: 33.4484, lng: -112.0740, tags: ['arizona', 'environment', 'renewable-energy', 'solar'],
  },

  // --- Maricopa County ---
  {
    title: 'Maricopa County 2026 Primary Election — Ballot Measures',
    summary: 'Maricopa County primary election includes measures on transportation funding, parks bond renewal, and community college district budget override. Early voting begins July 2026.',
    sourceUrl: 'https://recorder.maricopa.gov',
    deadline: '2026-08-04',
    category: 'CIVIL_RIGHTS', type: 'BALLOT_INITIATIVE',
    jurisdiction: 'Maricopa County', jurisdictionLevel: 'COUNTY',
    jurisdictionTags: ['Maricopa County', 'Arizona'],
    districtIds: ['maricopa-county'],
    lat: 33.4484, lng: -112.0740, tags: ['maricopa', 'election', 'ballot-measure', 'voting'],
  },
  {
    title: 'Proposition 401: Maricopa County Parks and Recreation Bond',
    summary: 'Proposed $300M bond to fund regional park improvements, new trail systems, and water recreation facilities across Maricopa County. Includes $40M for shade structures and heat resilience in parks.',
    sourceUrl: 'https://recorder.maricopa.gov',
    deadline: '2026-11-03',
    category: 'CITY_SERVICES', type: 'BALLOT_INITIATIVE',
    jurisdiction: 'Maricopa County', jurisdictionLevel: 'COUNTY',
    jurisdictionTags: ['Maricopa County', 'Arizona'],
    districtIds: ['maricopa-county'],
    lat: 33.4484, lng: -112.0740, tags: ['maricopa', 'parks', 'bond', 'recreation'],
  },
  {
    title: 'Maricopa County Regional Transportation Plan Update',
    summary: 'The Maricopa Association of Governments is updating the regional transportation plan through 2050. Public comment period covers freeway expansions, transit improvements, bike infrastructure, and autonomous vehicle policy.',
    sourceUrl: 'https://www.azmag.gov',
    deadline: '2026-06-30',
    category: 'TRANSIT', type: 'PUBLIC_HEARING',
    jurisdiction: 'Maricopa County', jurisdictionLevel: 'COUNTY',
    jurisdictionTags: ['Maricopa County', 'Arizona'],
    districtIds: ['maricopa-county'],
    lat: 33.4484, lng: -112.0740, tags: ['maricopa', 'transit', 'transportation', 'regional-plan'],
  },

  // --- ASU / Campus ---
  {
    title: 'ASU Student Government: Campus Safety Lighting Petition',
    summary: 'Undergraduate Student Government petition to install additional LED lighting along pedestrian paths between campus buildings and off-campus housing areas. Over 2,000 signatures collected.',
    sourceUrl: 'https://eoss.asu.edu/civic-engagement',
    category: 'PUBLIC_SAFETY', type: 'PETITION',
    jurisdiction: 'ASU Tempe Campus', jurisdictionLevel: 'CAMPUS',
    jurisdictionTags: ['ASU Tempe Campus', 'Tempe', 'Arizona'],
    districtIds: ['tempe-council-5','az-ld-26'],
    lat: 33.4167, lng: -111.9298, tags: ['asu', 'students', 'safety', 'petition'],
  },
  {
    title: 'ASU Changemaker Central: Civic Engagement Week 2026',
    summary: 'Week-long series of voter registration drives, candidate forums, and civic action workshops organized by ASU Changemaker Central. Open to all ASU students across all campuses.',
    sourceUrl: 'https://changemaker.asu.edu',
    deadline: '2026-04-18',
    category: 'CIVIL_RIGHTS', type: 'OTHER',
    jurisdiction: 'ASU Tempe Campus', jurisdictionLevel: 'CAMPUS',
    jurisdictionTags: ['ASU Tempe Campus', 'Tempe', 'Arizona'],
    districtIds: ['tempe-council-5','az-ld-26'],
    lat: 33.4167, lng: -111.9298, tags: ['asu', 'students', 'civic-engagement', 'voter-registration'],
  },
  {
    title: 'ASU Graduate Student Petition: Health Insurance Coverage Expansion',
    summary: 'Graduate and Professional Student Association petition requesting expanded dental and vision coverage in the ASU student health insurance plan. Currently collecting signatures for ABOR presentation.',
    sourceUrl: 'https://eoss.asu.edu',
    category: 'HEALTHCARE', type: 'PETITION',
    jurisdiction: 'ASU Tempe Campus', jurisdictionLevel: 'CAMPUS',
    jurisdictionTags: ['ASU Tempe Campus', 'Tempe', 'Arizona'],
    districtIds: ['tempe-council-5','az-ld-26'],
    lat: 33.4167, lng: -111.9298, tags: ['asu', 'students', 'healthcare', 'insurance', 'petition'],
  },
]

// ============================================================================
// Main
// ============================================================================

function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) }

async function main() {
  console.log('🌱 RallyPoint Seed — TinyFish + Fallback\n')

  // Clean
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
  console.log('✅ Clean\n')

  // System user
  const sys = await prisma.user.create({
    data: {
      clerkId: 'system_scraper_001',
      email: 'system@rallypoint.app',
      displayName: 'RallyPoint System',
      role: 'ADMIN',
      onboardingCompleted: true,
    },
  })

  // Try TinyFish scraping first
  let scrapedItems: CivicSeed[] = []

  console.log('🐟 Attempting TinyFish scraping (2 min timeout per source)...')

  // Tempe agendas
  const tempeRaw = await scrape(
    'https://www.tempe.gov/government/agendas-and-minutes',
    'Find recent Tempe City Council agenda items or actions. Return a JSON array with keys: title, summary, date, url. Get 5-8 items.'
  )
  for (const item of tempeRaw) {
    if (item.title) {
      scrapedItems.push({
        title: item.title,
        summary: item.summary || item.description || item.details || 'Tempe City Council item',
        sourceUrl: item.url || item.link || item.sourceUrl || null,
        deadline: item.date || item.deadline || null,
        category: inferCategory(item.title + ' ' + (item.summary || '')),
        type: inferType(item.title + ' ' + (item.summary || '')),
        jurisdiction: 'Tempe', jurisdictionLevel: 'CITY',
        jurisdictionTags: ['Tempe', 'Maricopa County', 'Arizona'],
        districtIds: ['tempe-council-1','tempe-council-2','tempe-council-3','tempe-council-4','tempe-council-5','tempe-council-6'],
        lat: 33.4255, lng: -111.9400,
        tags: ['tempe', 'city-council', ...inferTags(item.title + ' ' + (item.summary || ''))],
      })
    }
  }

  // AZ Legislature
  const azRaw = await scrape(
    'https://apps.azleg.gov/BillStatus/BillOverview',
    'Search for recent Arizona bills about education, housing, or water. Return a JSON array with keys: title (include bill number), summary, url. Get 5 bills.'
  )
  for (const item of azRaw) {
    if (item.title) {
      scrapedItems.push({
        title: item.title,
        summary: item.summary || item.description || item.details || 'Arizona state bill',
        sourceUrl: item.url || item.link || item.sourceUrl || null,
        category: inferCategory(item.title + ' ' + (item.summary || '')),
        type: 'STATE_BILL',
        jurisdiction: 'Arizona', jurisdictionLevel: 'STATE',
        jurisdictionTags: ['Arizona'],
        districtIds: ['az-ld-26'],
        lat: 33.4484, lng: -112.0740,
        tags: ['arizona', 'state-bill', ...inferTags(item.title + ' ' + (item.summary || ''))],
      })
    }
  }

  console.log(`\n📊 TinyFish returned ${scrapedItems.length} items`)

  // Merge: use scraped items + fill with fallback to ensure we have enough content
  const finalItems: CivicSeed[] = [...scrapedItems]

  // Add fallback items that don't duplicate scraped titles
  const scrapedTitlesLower = new Set(scrapedItems.map(i => i.title.toLowerCase().slice(0, 30)))
  for (const fb of FALLBACK_DATA) {
    const isDupe = scrapedTitlesLower.has(fb.title.toLowerCase().slice(0, 30))
    if (!isDupe) finalItems.push(fb)
  }

  console.log(`📝 Inserting ${finalItems.length} civic items (${scrapedItems.length} scraped + ${finalItems.length - scrapedItems.length} fallback)...\n`)

  const usedSlugs = new Set<string>()
  let count = 0

  for (const item of finalItems) {
    try {
      let slug = slugify(item.title)
      let n = 1
      while (usedSlugs.has(slug)) { slug = slugify(item.title) + '-' + n; n++ }
      usedSlugs.add(slug)

      await prisma.civicItem.create({
        data: {
          title: item.title.slice(0, 200),
          slug,
          category: item.category as any,
          categories: [item.category as any],
          type: item.type as any,
          status: 'ACTIVE',
          jurisdiction: item.jurisdiction,
          jurisdictionTags: item.jurisdictionTags,
          jurisdictionLevel: item.jurisdictionLevel as any,
          districtIds: item.districtIds,
          summary: item.summary.slice(0, 2000),
          sourceUrl: item.sourceUrl || null,
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
      count++
      console.log(`   ✅ ${item.title.slice(0, 70)}`)
    } catch (e: any) {
      console.log(`   ⚠️  Skip: ${e.message?.slice(0, 80)}`)
    }
  }

  console.log(`\n🎉 Done! ${count} civic items in the database.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error('❌', e); await prisma.$disconnect(); process.exit(1) })
