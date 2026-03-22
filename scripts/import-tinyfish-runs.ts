import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TinyFishRun {
  run_id: string;
  status: string;
  goal: string;
  created_at: string;
  result?: any;
  error?: any;
}

interface TinyFishResponse {
  data: TinyFishRun[];
  pagination: {
    total: number;
    next_cursor?: string;
    has_more: boolean;
  };
}

/**
 * Calculate quality score for an item (higher is better)
 */
function calculateItemQuality(item: any): number {
  let score = 0;
  
  // Title quality (max 10 points)
  const title = item.title || item.name || '';
  if (title.length > 20) score += 5;
  if (title.length > 40) score += 5;
  
  // Summary quality (max 20 points)
  const summary = item.summary || '';
  const summaryWords = summary.split(/\s+/).length;
  if (summaryWords > 20) score += 10;
  if (summaryWords > 40) score += 10;
  
  // Full description quality (max 30 points)
  const fullDescription = item.fullDescription || item.description || '';
  const descWords = fullDescription.split(/\s+/).length;
  if (descWords > 50) score += 10;
  if (descWords > 100) score += 10;
  if (descWords > 200) score += 10;
  
  // Has URL (10 points)
  if (item.sourceUrl || item.url) score += 10;
  
  // Has deadline (5 points)
  if (item.deadline || item.date) score += 5;
  
  // Has category (5 points)
  if (item.category) score += 5;
  
  // Has tags (5 points)
  if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) score += 5;
  
  // Has support numbers (5 points)
  if (item.targetSupport || item.currentSupport) score += 5;
  
  // Has action URL (5 points)
  if (item.officialActionUrl || item.actionUrl) score += 5;
  
  return score;
}

// Valid categories for RallyPoint (must match schema)
const VALID_CATEGORIES = [
  'HOUSING', 'EDUCATION', 'TRANSIT', 'PUBLIC_SAFETY', 'HEALTHCARE',
  'JOBS', 'ENVIRONMENT', 'CIVIL_RIGHTS', 'CITY_SERVICES', 'BUDGET',
  'ZONING', 'OTHER'
] as const;

// Valid types
const VALID_TYPES = [
  'PETITION', 'BALLOT_INITIATIVE', 'ORDINANCE', 'PUBLIC_HEARING',
  'COUNCIL_VOTE', 'SCHOOL_BOARD', 'STATE_BILL', 'CITY_POLICY', 'OTHER'
] as const;

/**
 * Validate and normalize category
 */
function validateCategory(category: string | undefined): string {
  if (!category) return 'OTHER';
  const upper = category.toUpperCase();
  return VALID_CATEGORIES.includes(upper as any) ? upper : 'OTHER';
}

/**
 * Validate and normalize type
 */
function validateType(type: string | undefined): string {
  if (!type) return 'OTHER';
  const upper = type.toUpperCase();
  return VALID_TYPES.includes(upper as any) ? upper : 'OTHER';
}

/**
 * Shorten title to max 80 characters while keeping it meaningful
 */
function shortenTitle(title: string): string {
  // Remove common prefixes
  let cleaned = title
    .replace(/^(Proposed|Discussion on|Meeting about|Regarding|Re:|About)\s+/i, '')
    .replace(/^(A|An|The)\s+/i, '')
    .trim();

  // If still too long, truncate at word boundary
  if (cleaned.length > 80) {
    cleaned = cleaned.substring(0, 77).trim();
    // Find last complete word
    const lastSpace = cleaned.lastIndexOf(' ');
    if (lastSpace > 60) {
      cleaned = cleaned.substring(0, lastSpace) + '...';
    } else {
      cleaned = cleaned + '...';
    }
  }

  return cleaned;
}

/**
 * Validate deadline is in the future
 */
function validateDeadline(deadline: Date | null): Date | null {
  if (!deadline) return null;
  
  const now = new Date('2026-03-22T00:00:00Z'); // Current date from system
  if (deadline <= now) {
    console.log(`    ⚠️  Deadline ${deadline.toISOString()} is in the past, skipping item`);
    return null; // Return null to indicate this item should be skipped
  }
  
  return deadline;
}

/**
 * Ensure summary is appropriate length (150-200 words)
 */
function normalizeSummary(summary: string, fullDescription: string): string {
  if (!summary && !fullDescription) return '';
  
  const text = summary || fullDescription;
  const words = text.split(/\s+/);
  
  // If too short, use more from fullDescription
  if (words.length < 30 && fullDescription && fullDescription !== summary) {
    const fullWords = fullDescription.split(/\s+/);
    return fullWords.slice(0, 50).join(' ') + (fullWords.length > 50 ? '...' : '');
  }
  
  // If too long, truncate to ~50 words
  if (words.length > 60) {
    return words.slice(0, 50).join(' ') + '...';
  }
  
  return text;
}

/**
 * Ensure fullDescription is appropriate length (300-500 words)
 */
function normalizeFullDescription(fullDescription: string, summary: string): string {
  if (!fullDescription && !summary) return '';
  
  const text = fullDescription || summary;
  const words = text.split(/\s+/);
  
  // If too short, repeat summary or pad
  if (words.length < 100 && summary && summary !== fullDescription) {
    return summary + '\n\n' + text;
  }
  
  // If too long, truncate
  if (words.length > 600) {
    return words.slice(0, 500).join(' ') + '...';
  }
  
  return text;
}

// Category mapping based on keywords in the data
function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  
  // Housing keywords
  if (lower.match(/\b(housing|rent|tenant|landlord|affordable|homeless|shelter|apartment|condo)\b/)) return 'HOUSING';
  
  // Education keywords
  if (lower.match(/\b(education|school|student|teacher|curriculum|college|university|tuition)\b/)) return 'EDUCATION';
  
  // Transit keywords
  if (lower.match(/\b(transit|transport|bus|train|rail|bike|pedestrian|traffic|road|highway)\b/)) return 'TRANSIT';
  
  // Public Safety keywords
  if (lower.match(/\b(police|fire|emergency|safety|crime|security|911)\b/)) return 'PUBLIC_SAFETY';
  
  // Healthcare keywords
  if (lower.match(/\b(health|medical|hospital|clinic|mental health|wellness|care)\b/)) return 'HEALTHCARE';
  
  // Jobs keywords
  if (lower.match(/\b(job|employment|wage|worker|labor|unemployment|career)\b/)) return 'JOBS';
  
  // Environment keywords
  if (lower.match(/\b(environment|climate|green|sustainability|pollution|conservation|park|tree)\b/)) return 'ENVIRONMENT';
  
  // Civil Rights keywords
  if (lower.match(/\b(civil rights|equality|discrimination|justice|voting|rights|equity)\b/)) return 'CIVIL_RIGHTS';
  
  // City Services keywords
  if (lower.match(/\b(utility|utilities|water|sewer|waste|garbage|service|infrastructure)\b/)) return 'CITY_SERVICES';
  
  // Budget keywords
  if (lower.match(/\b(budget|tax|fiscal|spending|revenue|finance|funding)\b/)) return 'BUDGET';
  
  // Zoning keywords
  if (lower.match(/\b(zoning|development|construction|building|land use|planning|permit)\b/)) return 'ZONING';
  
  return 'OTHER';
}

function inferType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('hearing') || lower.includes('public hearing')) return 'PUBLIC_HEARING';
  if (lower.includes('bill') || lower.includes('legislation') || lower.includes('state bill')) return 'STATE_BILL';
  if (lower.includes('petition') || lower.includes('initiative')) return 'PETITION';
  if (lower.includes('ballot') || lower.includes('ballot initiative')) return 'BALLOT_INITIATIVE';
  if (lower.includes('ordinance') || lower.includes('city ordinance')) return 'ORDINANCE';
  if (lower.includes('council') || lower.includes('vote') || lower.includes('council vote')) return 'COUNCIL_VOTE';
  if (lower.includes('school board') || lower.includes('board meeting')) return 'SCHOOL_BOARD';
  if (lower.includes('policy') || lower.includes('city policy')) return 'CITY_POLICY';
  return 'OTHER';
}

function inferJurisdictionLevel(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('state') || lower.includes('arizona') || lower.includes('legislature')) return 'STATE';
  if (lower.includes('county') || lower.includes('maricopa')) return 'COUNTY';
  if (lower.includes('campus') || lower.includes('asu') || lower.includes('university')) return 'CAMPUS';
  if (lower.includes('district') || lower.includes('school district')) return 'DISTRICT';
  return 'CITY';
}

async function fetchAllRuns(apiKey: string): Promise<TinyFishRun[]> {
  const allRuns: TinyFishRun[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  console.log('📥 Fetching runs from TinyFish dashboard...');

  while (hasMore) {
    const url = cursor 
      ? `https://agent.tinyfish.ai/v1/runs?cursor=${cursor}`
      : 'https://agent.tinyfish.ai/v1/runs';

    const response = await fetch(url, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch runs: ${response.statusText}`);
    }

    const data: TinyFishResponse = await response.json();
    allRuns.push(...data.data);
    
    console.log(`  ✓ Fetched ${data.data.length} runs (total: ${allRuns.length}/${data.pagination.total})`);

    hasMore = data.pagination.has_more;
    cursor = data.pagination.next_cursor;
  }

  return allRuns;
}

function extractCivicData(run: TinyFishRun): any[] {
  if (!run.result) {
    console.log(`  ⚠️  Run ${run.run_id.substring(0, 8)} has no result`);
    return [];
  }
  
  // Handle different result structures
  const items: any[] = [];
  
  // Debug: log the result structure
  console.log(`  🔍 Run ${run.run_id.substring(0, 8)} result type: ${Array.isArray(run.result) ? 'array' : typeof run.result}`);
  
  // If result is an array
  if (Array.isArray(run.result)) {
    console.log(`    → Found array with ${run.result.length} items`);
    items.push(...run.result);
  }
  // If result has a data property that's an array
  else if (run.result.data && Array.isArray(run.result.data)) {
    console.log(`    → Found result.data array with ${run.result.data.length} items`);
    items.push(...run.result.data);
  }
  // If result has items property
  else if (run.result.items && Array.isArray(run.result.items)) {
    console.log(`    → Found result.items array with ${run.result.items.length} items`);
    items.push(...run.result.items);
  }
  // If result has results property (common TinyFish structure)
  else if (run.result.results && Array.isArray(run.result.results)) {
    console.log(`    → Found result.results array with ${run.result.results.length} items`);
    items.push(...run.result.results);
  }
  // If result has output property
  else if (run.result.output) {
    console.log(`    → Found result.output, checking type...`);
    if (Array.isArray(run.result.output)) {
      console.log(`      → output is array with ${run.result.output.length} items`);
      items.push(...run.result.output);
    } else if (typeof run.result.output === 'string') {
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(run.result.output);
        if (Array.isArray(parsed)) {
          console.log(`      → Parsed output string to array with ${parsed.length} items`);
          items.push(...parsed);
        } else {
          console.log(`      → Parsed output string to single object`);
          items.push(parsed);
        }
      } catch {
        console.log(`      → output is string but not valid JSON`);
      }
    } else if (run.result.output.title || run.result.output.name) {
      console.log(`      → output is single object`);
      items.push(run.result.output);
    }
  }
  // If result is a single object with civic data
  else if (run.result.title || run.result.name) {
    console.log(`    → Found single object with title/name`);
    items.push(run.result);
  }
  // Last resort: check all top-level properties for arrays
  else {
    console.log(`    → Checking all properties for arrays...`);
    const keys = Object.keys(run.result);
    console.log(`      → Available keys: ${keys.join(', ')}`);
    for (const key of keys) {
      if (Array.isArray(run.result[key]) && run.result[key].length > 0) {
        console.log(`      → Found array at result.${key} with ${run.result[key].length} items`);
        items.push(...run.result[key]);
        break; // Only take the first array we find
      }
    }
  }

  if (items.length === 0) {
    console.log(`    ⚠️  No items extracted. Result structure:`, JSON.stringify(run.result, null, 2).substring(0, 500));
  }

  return items;
}

async function main() {
  const apiKey = process.env.TINYFISH_API_KEY;
  
  if (!apiKey) {
    console.error('❌ TINYFISH_API_KEY not found in environment variables');
    process.exit(1);
  }

  try {
    // Fetch all runs from TinyFish
    const runs = await fetchAllRuns(apiKey);
    console.log(`\n✅ Fetched ${runs.length} total runs`);

    // Filter for completed runs with results
    const completedRuns = runs.filter(run => 
      run.status === 'COMPLETED' && run.result && !run.error
    );
    console.log(`✅ Found ${completedRuns.length} completed runs with results`);

    if (completedRuns.length === 0) {
      console.log('\n⚠️  No completed runs with results found. Please run some TinyFish agents first.');
      return;
    }

    // Extract civic items from all runs
    const allCivicData: any[] = [];
    for (const run of completedRuns) {
      const items = extractCivicData(run);
      allCivicData.push(...items.map(item => ({ ...item, source_run_id: run.run_id })));
    }

    console.log(`\n📊 Extracted ${allCivicData.length} civic items from runs`);

    if (allCivicData.length === 0) {
      console.log('\n⚠️  No civic data found in completed runs.');
      return;
    }

    // Ask for confirmation before modifying database
    console.log('\n⚠️  Import mode: UPDATE existing items with better versions, INSERT new items');
    console.log('\nOptions:');
    console.log('  1. Smart update (recommended) - Keep existing items, update with better versions, add new items');
    console.log('  2. Clean import - Delete all existing items and import fresh');
    console.log('\nDefaulting to Smart update in 5 seconds...');
    console.log('Press Ctrl+C to cancel');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const cleanImport = false; // Set to true if you want to clean everything

    if (cleanImport) {
      // Clean existing civic items
      console.log('\n🧹 Cleaning existing civic items...');
      await prisma.engagementEvent.deleteMany({});
      await prisma.comment.deleteMany({});
      await prisma.civicItem.deleteMany({});
      console.log('✅ Database cleaned');
    } else {
      console.log('\n🔄 Smart update mode - preserving existing items');
    }

    // Group items by slug to handle duplicates intelligently
    console.log('\n🔄 Deduplicating and selecting best versions...');
    const itemsBySlug = new Map<string, any[]>();
    
    for (const item of allCivicData) {
      const title = item.title || item.name || item.subject || item.heading || item.issue || '';
      if (!title) continue;
      
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);
      
      if (!itemsBySlug.has(slug)) {
        itemsBySlug.set(slug, []);
      }
      itemsBySlug.get(slug)!.push(item);
    }
    
    console.log(`  Found ${itemsBySlug.size} unique items (${allCivicData.length} total before deduplication)`);
    
    // Select best version of each item
    const deduplicatedItems: any[] = [];
    for (const [slug, items] of itemsBySlug.entries()) {
      if (items.length === 1) {
        deduplicatedItems.push(items[0]);
      } else {
        // Multiple versions exist - select the best one
        const bestItem = items.reduce((best, current) => {
          // Calculate quality score for each item
          const bestScore = calculateItemQuality(best);
          const currentScore = calculateItemQuality(current);
          
          // If scores are equal, prefer the one from the latest run
          if (currentScore === bestScore) {
            // Items are processed in order of runs, so later items are from newer runs
            return current;
          }
          
          return currentScore > bestScore ? current : best;
        });
        
        console.log(`  ℹ️  Found ${items.length} versions of "${slug.substring(0, 40)}...", keeping best version`);
        deduplicatedItems.push(bestItem);
      }
    }
    
    console.log(`  ✅ Deduplicated to ${deduplicatedItems.length} items\n`);

    // Process and insert civic items with validation
    console.log('📝 Processing and inserting civic items...');
    let inserted = 0;
    let skipped = 0;
    let updated = 0;
    let skippedReasons: Record<string, number> = {
      'no-title': 0,
      'no-url': 0,
      'expired-deadline': 0,
      'invalid-data': 0,
    };

    for (const item of deduplicatedItems) {
      try {
        // Extract fields with fallbacks
        let title = item.title || item.name || item.subject || item.heading || item.issue || '';
        const rawDescription = item.fullDescription || item.description || item.summary || item.details || item.body || item.content || '';
        const rawSummary = item.summary || rawDescription.substring(0, 500);
        const url = item.sourceUrl || item.url || item.link || item.source_url || item.href || '';
        
        // Validate required fields
        if (!title || title === 'Untitled') {
          skippedReasons['no-title']++;
          skipped++;
          continue;
        }
        
        if (!url) {
          console.log(`  ⚠️  Skipping "${title.substring(0, 50)}": no URL`);
          skippedReasons['no-url']++;
          skipped++;
          continue;
        }

        // Apply transformations
        title = shortenTitle(title);
        const summary = normalizeSummary(rawSummary, rawDescription);
        const fullDescription = normalizeFullDescription(rawDescription, rawSummary);

        // Create slug from title
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 100);

        // Check if already exists in database
        const existing = await prisma.civicItem.findUnique({
          where: { slug },
        });

        // Validate and normalize category and type
        const combinedText = `${title} ${fullDescription}`;
        const rawCategory = item.category || inferCategory(combinedText);
        const category = validateCategory(rawCategory);
        
        const rawType = item.type || inferType(combinedText);
        const type = validateType(rawType);
        
        const jurisdictionLevel = item.jurisdictionLevel || inferJurisdictionLevel(combinedText);

        // Parse and validate deadline
        let deadline: Date | null = null;
        if (item.deadline || item.date || item.meeting_date || item.dueDate) {
          const dateStr = item.deadline || item.date || item.meeting_date || item.dueDate;
          try {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              deadline = validateDeadline(parsedDate);
              if (deadline === null && parsedDate.getTime() > 0) {
                // Deadline was in the past, skip this item
                console.log(`  ⚠️  Skipping "${title.substring(0, 50)}": expired deadline`);
                skippedReasons['expired-deadline']++;
                skipped++;
                continue;
              }
            }
          } catch {
            deadline = null;
          }
        }

        // Determine jurisdiction
        const jurisdiction = item.jurisdiction || item.city || item.county || item.location || 'Tempe, AZ';
        const jurisdictionTags = item.jurisdictionTags || item.jurisdiction_tags || [jurisdiction];

        // Extract support numbers
        const targetSupport = item.targetSupport || item.target_support || item.goal || null;
        const currentSupport = item.currentSupport || item.current_support || item.signatures || 0;

        // Extract action URL
        const officialActionUrl = item.officialActionUrl || item.official_action_url || item.actionUrl || item.action_url || null;
        const allowsOnlineSignature = item.allowsOnlineSignature ?? item.allows_online_signature ?? (!!officialActionUrl);

        const itemData = {
          title,
          slug,
          category,
          type,
          status: 'ACTIVE' as const,
          jurisdiction,
          jurisdictionTags: Array.isArray(jurisdictionTags) ? jurisdictionTags : [jurisdictionTags],
          jurisdictionLevel,
          districtIds: item.districtIds || item.district_ids || [],
          summary: summary.substring(0, 500),
          fullDescription,
          sourceUrl: url,
          officialActionUrl,
          deadline,
          targetSupport,
          currentSupport,
          allowsOnlineSignature,
          tags: item.tags || [],
          isVerified: item.isVerified ?? item.is_verified ?? false,
        };

        if (existing) {
          // Update existing item if new version has more information
          const existingQuality = calculateItemQuality({
            title: existing.title,
            summary: existing.summary,
            fullDescription: existing.fullDescription,
            sourceUrl: existing.sourceUrl,
            deadline: existing.deadline,
            category: existing.category,
            tags: existing.tags,
            targetSupport: existing.targetSupport,
            currentSupport: existing.currentSupport,
            officialActionUrl: existing.officialActionUrl,
          });
          
          const newQuality = calculateItemQuality(item);
          
          if (newQuality > existingQuality) {
            await prisma.civicItem.update({
              where: { slug },
              data: itemData,
            });
            console.log(`  🔄 Updated "${title.substring(0, 50)}" with better version (quality: ${existingQuality} → ${newQuality})`);
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Create new civic item
          await prisma.civicItem.create({
            data: itemData,
          });

          inserted++;
          if (inserted % 10 === 0) {
            console.log(`  ✓ Inserted ${inserted} items...`);
          }
        }
      } catch (error: any) {
        console.error(`  ⚠️  Failed to process item: ${error.message}`);
        skippedReasons['invalid-data']++;
        skipped++;
      }
    }

    console.log(`\n🎉 Import complete!`);
    console.log(`   ✅ Inserted: ${inserted} new civic items`);
    console.log(`   🔄 Updated: ${updated} existing items with better versions`);
    console.log(`   ⚠️  Skipped: ${skipped} items`);
    console.log(`\n📊 Skip reasons:`);
    console.log(`   - No title: ${skippedReasons['no-title']}`);
    console.log(`   - No URL: ${skippedReasons['no-url']}`);
    console.log(`   - Expired deadline: ${skippedReasons['expired-deadline']}`);
    console.log(`   - Invalid data: ${skippedReasons['invalid-data']}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
