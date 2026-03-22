# TinyFish Real Data Implementation Plan

## 🎯 Objective
Replace hardcoded fallback civic items with real, accurate data scraped from government sources using TinyFish AI agent.

## 📊 Current State Analysis

### Problems with Current Implementation
1. **Fallback-Heavy**: Currently using 15+ hardcoded fallback items
2. **Limited Scraping**: Only scraping 2 sources (Tempe agendas, AZ Legislature)
3. **Poor Data Extraction**: TinyFish returns data but extraction logic is weak
4. **Missing Required Fields**: Scraped data often lacks:
   - Detailed summaries
   - Accurate deadlines
   - Official action URLs
   - Full descriptions
   - Target support numbers
5. **No Validation**: No quality checks on scraped data
6. **Single Run**: Only runs during seeding, not continuously

### What We Need for Each Civic Item
```typescript
{
  title: string                    // ✅ Usually available
  summary: string                  // ⚠️ Often too short
  fullDescription?: string         // ❌ Rarely available
  sourceUrl?: string              // ⚠️ Sometimes available
  deadline?: Date                 // ⚠️ Often missing or wrong format
  officialActionUrl?: string      // ❌ Rarely available
  targetSupport?: number          // ❌ Never available from scraping
  currentSupport: number          // ✅ Can default to 0
  allowsOnlineSignature: boolean  // ✅ Can infer from type
  category: Category              // ✅ Can infer
  type: CivicItemType            // ✅ Can infer
  jurisdiction: string            // ✅ Known from source
  jurisdictionLevel: JurisdictionLevel // ✅ Known from source
  jurisdictionTags: string[]      // ✅ Known from source
  districtIds: string[]           // ✅ Known from source
  tags: string[]                  // ✅ Can infer
  isVerified: boolean             // ✅ True for government sources
}
```

## 🔧 Solution Architecture

### Phase 1: Improve TinyFish Scraping (Immediate)

**1.1 Expand Data Sources**
```typescript
const SOURCES = [
  // Tempe
  {
    url: 'https://www.tempe.gov/government/agendas-and-minutes',
    goal: 'Extract recent Tempe City Council agenda items with title, summary, date, and link',
    jurisdiction: 'Tempe',
    level: 'CITY',
  },
  {
    url: 'https://www.tempe.gov/government/community-development/current-projects',
    goal: 'Extract current development projects with title, description, location, and status',
    jurisdiction: 'Tempe',
    level: 'CITY',
  },
  
  // Arizona Legislature
  {
    url: 'https://apps.azleg.gov/BillStatus/BillOverview',
    goal: 'Extract active Arizona bills with bill number, title, summary, sponsor, and status',
    jurisdiction: 'Arizona',
    level: 'STATE',
  },
  
  // Maricopa County
  {
    url: 'https://recorder.maricopa.gov/electioninfo/electioninfo.aspx',
    goal: 'Extract upcoming ballot measures with proposition number, title, description, and election date',
    jurisdiction: 'Maricopa County',
    level: 'COUNTY',
  },
  
  // ASU
  {
    url: 'https://eoss.asu.edu/dos/petitions',
    goal: 'Extract active student petitions with title, description, goal, and current signatures',
    jurisdiction: 'ASU Tempe Campus',
    level: 'CAMPUS',
  },
]
```

**1.2 Improve Data Extraction**
- Better JSON parsing with multiple fallback strategies
- Handle nested structures
- Extract from HTML tables
- Parse dates in multiple formats
- Clean and normalize text

**1.3 Enhance Data Quality**
- Validate required fields before insertion
- Generate missing summaries from titles
- Infer missing metadata (category, type, tags)
- Set reasonable defaults
- Flag low-quality items for manual review

### Phase 2: Add AI Enhancement (Next)

**2.1 Use Claude to Enrich Data**
```typescript
// For each scraped item with minimal data:
const enriched = await enrichWithClaude({
  title: item.title,
  rawSummary: item.summary,
  sourceUrl: item.url,
  context: 'Tempe, Arizona civic issue',
})

// Claude generates:
// - Detailed summary (200-300 words)
// - Full description (if source URL is accessible)
// - Who's affected
// - What changes
// - Why it matters
// - Estimated deadline (if not provided)
// - Suggested tags
```

**2.2 Generate AI Summaries Automatically**
- Run Claude summarization on all new items
- Store in AISummary table
- Include all required fields (whoAffected, whatChanges, etc.)

### Phase 3: Continuous Updates (Future)

**3.1 Scheduled Scraping**
```typescript
// Cron job or scheduled task
// Run daily at 2 AM
async function dailyUpdate() {
  // Scrape all sources
  // Compare with existing items
  // Add new items
  // Update changed items
  // Mark closed items
}
```

**3.2 Webhook Integration**
- Listen for government data updates
- Trigger scraping on new agendas
- Real-time updates for urgent items

## 📝 Implementation Steps

### Step 1: Update TinyFish Seed Script ✅

**File**: `prisma/seed-tinyfish-improved.ts`

**Changes**:
1. Update API key to new key
2. Add more data sources (10+ sources)
3. Improve extraction logic with better parsing
4. Add data validation before insertion
5. Generate missing fields with AI
6. Better error handling and logging
7. Retry logic for failed scrapes
8. Quality scoring for scraped items

### Step 2: Create Data Enrichment Service

**File**: `src/lib/scraping/enrichment.ts`

**Purpose**: Use Claude to fill in missing data

```typescript
export async function enrichCivicItem(item: PartialCivicItem) {
  // Use Claude to generate:
  // - Better summary
  // - Full description
  // - Infer deadline
  // - Generate tags
  // - Categorize accurately
}
```

### Step 3: Add Data Validation

**File**: `src/lib/scraping/validation.ts`

**Purpose**: Ensure data quality

```typescript
export function validateCivicItem(item: any): ValidationResult {
  const errors = []
  const warnings = []
  
  // Required fields
  if (!item.title || item.title.length < 10) {
    errors.push('Title too short')
  }
  
  if (!item.summary || item.summary.length < 50) {
    warnings.push('Summary too short')
  }
  
  // URL validation
  if (item.sourceUrl && !isValidUrl(item.sourceUrl)) {
    errors.push('Invalid source URL')
  }
  
  // Date validation
  if (item.deadline && !isValidDate(item.deadline)) {
    warnings.push('Invalid deadline format')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: calculateQualityScore(item),
  }
}
```

### Step 4: Create Admin Dashboard for Data Quality

**File**: `src/app/admin/data-quality/page.tsx`

**Purpose**: Monitor scraped data quality

- Show items with low quality scores
- Allow manual review and editing
- Flag items for re-scraping
- View scraping logs and errors

### Step 5: Add Continuous Scraping

**File**: `src/lib/scraping/scheduler.ts`

**Purpose**: Keep data fresh

```typescript
// Run via cron or scheduled task
export async function scheduledScrape() {
  // Scrape all sources
  // Update existing items
  // Add new items
  // Archive old items
}
```

## 🎯 Success Criteria

### Data Quality Metrics
- ✅ 90%+ of items have detailed summaries (200+ chars)
- ✅ 80%+ of items have source URLs
- ✅ 70%+ of items have deadlines
- ✅ 100% of items have accurate categories
- ✅ 100% of items have jurisdiction info
- ✅ 50%+ of items have official action URLs

### Coverage Metrics
- ✅ 50+ active civic items at any time
- ✅ 10+ new items added per week
- ✅ Coverage across all categories
- ✅ Coverage across all jurisdiction levels
- ✅ Mix of item types (petitions, bills, hearings, etc.)

### Freshness Metrics
- ✅ Items updated within 24 hours of source changes
- ✅ Closed items marked within 48 hours
- ✅ New items added within 12 hours of publication

## 🚀 Quick Win: Immediate Improvements

### 1. Better Extraction Logic
```typescript
// Current: Simple key checking
// Improved: Recursive search with scoring

function extractBestArray(obj: any): any[] {
  const candidates = findAllArrays(obj)
  return candidates
    .map(arr => ({
      array: arr,
      score: scoreArray(arr), // Check for title, summary, etc.
    }))
    .sort((a, b) => b.score - a.score)[0]?.array || []
}
```

### 2. Smarter Inference
```typescript
// Current: Simple keyword matching
// Improved: ML-based classification

function inferCategory(text: string): Category {
  const features = extractFeatures(text)
  const scores = CATEGORIES.map(cat => ({
    category: cat,
    score: calculateScore(features, cat),
  }))
  return scores.sort((a, b) => b.score - a.score)[0].category
}
```

### 3. Data Enrichment
```typescript
// Add missing data using Claude
async function enrichItem(item: PartialItem): Promise<FullItem> {
  if (!item.summary || item.summary.length < 100) {
    item.summary = await generateSummary(item.title, item.sourceUrl)
  }
  
  if (!item.deadline) {
    item.deadline = await inferDeadline(item.title, item.summary)
  }
  
  if (!item.officialActionUrl && item.sourceUrl) {
    item.officialActionUrl = await findActionUrl(item.sourceUrl)
  }
  
  return item as FullItem
}
```

## 📋 Testing Plan

### Unit Tests
- Test extraction logic with sample responses
- Test inference functions with various inputs
- Test validation with good and bad data

### Integration Tests
- Test full scraping pipeline
- Test data enrichment
- Test database insertion

### Manual Testing
- Review scraped items in admin dashboard
- Verify data accuracy against sources
- Check user-facing display

## 🔄 Rollout Plan

### Week 1: Foundation
- ✅ Update TinyFish seed script
- ✅ Add data validation
- ✅ Improve extraction logic
- ✅ Test with current sources

### Week 2: Expansion
- ✅ Add 5+ new data sources
- ✅ Implement data enrichment
- ✅ Create admin dashboard
- ✅ Test end-to-end

### Week 3: Automation
- ✅ Add scheduled scraping
- ✅ Set up monitoring
- ✅ Create alerts for failures
- ✅ Document processes

### Week 4: Optimization
- ✅ Tune extraction algorithms
- ✅ Improve data quality
- ✅ Optimize performance
- ✅ Launch to production

## 📚 Resources Needed

### APIs & Services
- TinyFish API (already have)
- Claude API (already have)
- Cron service (for scheduling)

### Development Time
- Seed script improvements: 4 hours
- Data enrichment: 6 hours
- Admin dashboard: 8 hours
- Scheduled scraping: 4 hours
- Testing & QA: 6 hours
- **Total: ~28 hours**

### Ongoing Maintenance
- Monitor scraping: 2 hours/week
- Review data quality: 2 hours/week
- Add new sources: 2 hours/month
- Update extraction logic: 4 hours/month

## 🎉 Expected Outcomes

### User Experience
- Real, current civic issues from government sources
- Accurate information with source links
- Fresh content updated daily
- Comprehensive coverage of local issues

### Platform Credibility
- Verified government data
- Transparent sourcing
- Up-to-date information
- Professional presentation

### Engagement
- More relevant issues for users
- Higher engagement rates
- Better matching to user interests
- Increased trust in platform
