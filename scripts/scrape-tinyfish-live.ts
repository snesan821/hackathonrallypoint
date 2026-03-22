import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScrapingSource {
  name: string;
  url: string;
  goal: string;
  priority: number;
}

// Define all scraping sources - mix of government agendas and petitions
const SCRAPING_SOURCES: ScrapingSource[] = [
  {
    name: 'Tempe City Council Agendas',
    url: 'https://tempe.hylandcloud.com/AgendaOnline',
    priority: 1,
    goal: `Go to the Tempe agenda system and find upcoming City Council meetings in the next 60 days. Click on each meeting to see the agenda items.

For each agenda item, extract:
- title: Full agenda item title (e.g., "Ordinance No. 2026.15 - Zoning Change for Mill Avenue Development")
- summary: 2-3 sentence summary of what this agenda item is about
- fullDescription: 200-500 word description. If there's a staff report or memo, read it and summarize the key points, background, and community impact.
- sourceUrl: URL to this specific meeting on tempe.hylandcloud.com
- deadline: Meeting date and time in ISO format (e.g., "2026-03-26T18:00:00Z")
- category: HOUSING/EDUCATION/TRANSIT/PUBLIC_SAFETY/HEALTHCARE/JOBS/ENVIRONMENT/CIVIL_RIGHTS/CITY_SERVICES/BUDGET/ZONING/OTHER
- type: PUBLIC_HEARING/COUNCIL_VOTE/ORDINANCE/CITY_POLICY
- jurisdiction: "Tempe, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: "https://www.tempe.gov/government/city-clerk-s-office/council-meeting-information"
- allowsOnlineSignature: true
- tags: Array of 3-5 relevant keywords
- organizationName: "Tempe City Council"
- organizationUrl: "https://www.tempe.gov"

Return ONLY meetings in the next 60 days. Return as JSON array.`,
  },
  {
    name: 'Tempe Public Meeting Schedules',
    url: 'https://www.tempe.gov/government/city-clerk-s-office/public-meeting-schedules-agendas-and-minutes',
    priority: 1,
    goal: `Find upcoming Tempe public meetings, hearings, and commission meetings in the next 60 days.

For each meeting/hearing, extract:
- title: Meeting or hearing title
- summary: 2-3 sentence description
- fullDescription: 200-500 words about what will be discussed
- sourceUrl: Direct URL to the meeting info
- deadline: Meeting date ISO format
- category: HOUSING/EDUCATION/TRANSIT/PUBLIC_SAFETY/HEALTHCARE/JOBS/ENVIRONMENT/CIVIL_RIGHTS/CITY_SERVICES/BUDGET/ZONING/OTHER
- type: PUBLIC_HEARING/COUNCIL_VOTE/ORDINANCE/CITY_POLICY
- jurisdiction: "Tempe, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: "https://www.tempe.gov/government/city-clerk-s-office/council-meeting-information"
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "City of Tempe"
- organizationUrl: "https://www.tempe.gov"

Return ONLY upcoming meetings. Return as JSON array.`,
  },
  {
    name: 'Tempe Petitions',
    url: 'https://www.change.org/search?q=tempe%20arizona',
    priority: 1,
    goal: `Find ACTIVE petitions about Tempe, Arizona currently open for signatures.

For each active petition:
- title: Full petition title
- summary: First 2-3 sentences
- fullDescription: Complete petition text (200-500 words)
- sourceUrl: Direct petition URL
- deadline: null
- category: HOUSING/EDUCATION/TRANSIT/PUBLIC_SAFETY/HEALTHCARE/JOBS/ENVIRONMENT/CIVIL_RIGHTS/CITY_SERVICES/BUDGET/ZONING/OTHER
- type: "PETITION"
- jurisdiction: "Tempe, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: Same as sourceUrl
- targetSupport: Signature goal
- currentSupport: Current signatures
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: Petition creator
- organizationUrl: null

Return ONLY active petitions. Return as JSON array.`,
  },
  {
    name: 'Phoenix City Council',
    url: 'https://phoenix.legistar.com/Calendar.aspx',
    priority: 2,
    goal: `Find upcoming Phoenix City Council meetings in the next 60 days. Look at the calendar and click on upcoming meetings to see agenda items.

For each agenda item:
- title: Full agenda item title
- summary: 2-3 sentences
- fullDescription: 200-500 words
- sourceUrl: Direct URL on phoenix.legistar.com
- deadline: Meeting date ISO format
- category: HOUSING/EDUCATION/TRANSIT/PUBLIC_SAFETY/HEALTHCARE/JOBS/ENVIRONMENT/CIVIL_RIGHTS/CITY_SERVICES/BUDGET/ZONING/OTHER
- type: PUBLIC_HEARING/COUNCIL_VOTE/ORDINANCE/CITY_POLICY
- jurisdiction: "Phoenix, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: "https://phoenix.legistar.com"
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "Phoenix City Council"
- organizationUrl: "https://www.phoenix.gov"

Return ONLY upcoming meetings. Return as JSON array.`,
  },
  {
    name: 'Phoenix Petitions',
    url: 'https://www.change.org/search?q=phoenix%20arizona',
    priority: 2,
    goal: `Find ACTIVE petitions about Phoenix, Arizona currently open for signatures.

For each active petition:
- title: Full petition title
- summary: First 2-3 sentences
- fullDescription: Complete petition text (200-500 words)
- sourceUrl: Direct petition URL
- deadline: null
- category: HOUSING/EDUCATION/TRANSIT/PUBLIC_SAFETY/HEALTHCARE/JOBS/ENVIRONMENT/CIVIL_RIGHTS/CITY_SERVICES/BUDGET/ZONING/OTHER
- type: "PETITION"
- jurisdiction: "Phoenix, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: Same as sourceUrl
- targetSupport: Signature goal
- currentSupport: Current signatures
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: Petition creator
- organizationUrl: null

Return ONLY active petitions. Return as JSON array.`,
  },
  {
    name: 'Mesa City Council',
    url: 'https://www.mesaaz.gov/government/city-council/agendas-minutes',
    priority: 2,
    goal: `Find upcoming Mesa City Council meetings in the next 60 days.

For each agenda item:
- title: Full agenda item title
- summary: 2-3 sentences
- fullDescription: 200-500 words
- sourceUrl: Direct URL
- deadline: Meeting date ISO format
- category: HOUSING/EDUCATION/TRANSIT/PUBLIC_SAFETY/HEALTHCARE/JOBS/ENVIRONMENT/CIVIL_RIGHTS/CITY_SERVICES/BUDGET/ZONING/OTHER
- type: PUBLIC_HEARING/COUNCIL_VOTE/ORDINANCE/CITY_POLICY
- jurisdiction: "Mesa, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: URL for public comments
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "Mesa City Council"
- organizationUrl: "https://www.mesaaz.gov"

Return ONLY upcoming meetings. Return as JSON array.`,
  },
  {
    name: 'Scottsdale City Council',
    url: 'https://eservices.scottsdaleaz.gov/cityclerk/PlannedAgendas',
    priority: 2,
    goal: `Find upcoming Scottsdale City Council meetings in the next 60 days.

For each agenda item:
- title: Full agenda item title
- summary: 2-3 sentences
- fullDescription: 200-500 words
- sourceUrl: Direct URL
- deadline: Meeting date ISO format
- category: HOUSING/EDUCATION/TRANSIT/PUBLIC_SAFETY/HEALTHCARE/JOBS/ENVIRONMENT/CIVIL_RIGHTS/CITY_SERVICES/BUDGET/ZONING/OTHER
- type: PUBLIC_HEARING/COUNCIL_VOTE/ORDINANCE/CITY_POLICY
- jurisdiction: "Scottsdale, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: "https://www.scottsdaleaz.gov/council/meeting-information"
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "Scottsdale City Council"
- organizationUrl: "https://www.scottsdaleaz.gov"

Return ONLY upcoming meetings. Return as JSON array.`,
  },
  {
    name: 'ASU Petitions',
    url: 'https://www.change.org/search?q=asu%20arizona%20state%20university',
    priority: 1,
    goal: `Find ACTIVE petitions about Arizona State University currently open for signatures.

For each active petition:
- title: Full petition title
- summary: First 2-3 sentences
- fullDescription: Complete petition text (200-500 words)
- sourceUrl: Direct petition URL
- deadline: null
- category: Usually EDUCATION or CIVIL_RIGHTS
- type: "PETITION"
- jurisdiction: "Arizona State University, Tempe"
- jurisdictionLevel: "CAMPUS"
- officialActionUrl: Same as sourceUrl
- targetSupport: Signature goal
- currentSupport: Current signatures
- allowsOnlineSignature: true
- tags: Include "students", "faculty", "staff"
- organizationName: Petition creator
- organizationUrl: null

Return ONLY active petitions. Return as JSON array.`,
  },
  {
    name: 'Maricopa County Board',
    url: 'https://www.maricopa.gov/AgendaCenter',
    priority: 3,
    goal: `Find upcoming Maricopa County Board of Supervisors meetings in the next 60 days.

For each agenda item:
- title: Full agenda item title
- summary: 2-3 sentences
- fullDescription: 200-500 words
- sourceUrl: Direct URL
- deadline: Meeting date ISO format
- category: HOUSING/EDUCATION/TRANSIT/PUBLIC_SAFETY/HEALTHCARE/JOBS/ENVIRONMENT/CIVIL_RIGHTS/CITY_SERVICES/BUDGET/ZONING/OTHER
- type: PUBLIC_HEARING/COUNCIL_VOTE/CITY_POLICY
- jurisdiction: "Maricopa County, AZ"
- jurisdictionLevel: "COUNTY"
- officialActionUrl: "https://www.maricopa.gov/324/Board-of-Supervisors-Meeting-Information"
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "Maricopa County Board of Supervisors"
- organizationUrl: "https://www.maricopa.gov"

Return ONLY upcoming meetings. Return as JSON array.`,
  },
];

async function scrapeSingleSource(source: ScrapingSource): Promise<any[]> {
  console.log(`\n🔍 Scraping: ${source.name}`);
  console.log(`   URL: ${source.url}`);

  try {
    const response = await fetch('https://agent.tinyfish.ai/v1/automation/run-sse', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.TINYFISH_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: source.url,
        goal: source.goal,
        stealth: true,
        timeout: 180000, // 3 minute timeout per source
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Missing response body');

    const decoder = new TextDecoder();
    let buffer = '';
    let result: any = null;
    let lastStatus = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(line.slice(6));

          if (data.type === 'status') {
            const status = data.message || data.status || '';
            if (status !== lastStatus) {
              process.stdout.write(`\r   Status: ${status.substring(0, 60)}...`);
              lastStatus = status;
            }
          } else if (data.type === 'result' || data.type === 'complete') {
            result = data.result || data.data;
            console.log('\n   ✅ Scraping complete');
          } else if (data.type === 'error') {
            throw new Error(data.message || 'Scraping failed');
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    }

    if (!result) {
      console.log('   ⚠️  No result returned');
      return [];
    }

    // Extract items from various result structures
    let items: any[] = [];
    if (Array.isArray(result)) {
      items = result;
    } else if (result.output && Array.isArray(result.output)) {
      items = result.output;
    } else if (result.data && Array.isArray(result.data)) {
      items = result.data;
    } else if (typeof result.output === 'string') {
      try {
        const parsed = JSON.parse(result.output);
        items = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        console.log('   ⚠️  Could not parse output string');
      }
    } else if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        items = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        console.log('   ⚠️  Could not parse result string');
      }
    }

    console.log(`   📊 Extracted ${items.length} items`);
    return items;
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return [];
  }
}

async function main() {
  const apiKey = process.env.TINYFISH_API_KEY;

  if (!apiKey) {
    console.error('❌ TINYFISH_API_KEY not found in environment variables');
    process.exit(1);
  }

  console.log('🚀 Starting live TinyFish scraping...\n');

  // Scrape all sources
  const allItems: any[] = [];
  for (const source of SCRAPING_SOURCES) {
    const items = await scrapeSingleSource(source);
    allItems.push(...items);

    // Delay between sources
    if (source !== SCRAPING_SOURCES[SCRAPING_SOURCES.length - 1]) {
      console.log('   ⏳ Waiting 3 seconds before next source...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n📊 Total items extracted: ${allItems.length}`);

  if (allItems.length === 0) {
    console.log('\n⚠️  No items extracted. Exiting without database changes.');
    return;
  }

  // Ask for confirmation
  console.log('\n⚠️  This will DELETE all existing civic items and insert new data.');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Clean database
  console.log('\n🧹 Cleaning existing civic items...');
  await prisma.engagementEvent.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.civicItem.deleteMany({});
  console.log('✅ Database cleaned');

  // Insert items
  console.log('\n📝 Inserting civic items...');
  let inserted = 0;
  let skipped = 0;

  for (const item of allItems) {
    try {
      if (!item.title || !item.sourceUrl) {
        skipped++;
        continue;
      }

      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);

      const existing = await prisma.civicItem.findUnique({ where: { slug } });
      if (existing) {
        skipped++;
        continue;
      }

      let deadline: Date | null = null;
      if (item.deadline) {
        try {
          deadline = new Date(item.deadline);
          if (isNaN(deadline.getTime())) deadline = null;
        } catch {
          deadline = null;
        }
      }

      await prisma.civicItem.create({
        data: {
          title: item.title,
          slug,
          category: item.category || 'OTHER',
          type: item.type || 'OTHER',
          status: 'ACTIVE',
          jurisdiction: item.jurisdiction || 'Tempe, AZ',
          jurisdictionTags: Array.isArray(item.jurisdictionTags)
            ? item.jurisdictionTags
            : [item.jurisdiction || 'Tempe, AZ'],
          jurisdictionLevel: item.jurisdictionLevel || 'CITY',
          districtIds: item.districtIds || [],
          summary: (item.summary || item.fullDescription || '').substring(0, 500),
          fullDescription: item.fullDescription || item.summary || '',
          sourceUrl: item.sourceUrl,
          officialActionUrl: item.officialActionUrl || null,
          deadline,
          targetSupport: item.targetSupport || null,
          currentSupport: item.currentSupport || 0,
          allowsOnlineSignature: item.allowsOnlineSignature ?? false,
          tags: Array.isArray(item.tags) ? item.tags : [],
          isVerified: false,
        },
      });

      inserted++;
      if (inserted % 10 === 0) {
        console.log(`  ✓ Inserted ${inserted} items...`);
      }
    } catch (error: any) {
      console.error(`  ⚠️  Failed to insert: ${error.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`   ✅ Inserted: ${inserted} civic items`);
  console.log(`   ⚠️  Skipped: ${skipped} items`);

  await prisma.$disconnect();
}

main().catch(console.error);
