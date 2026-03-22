# Live TinyFish Scraping Guide

This script uses the TinyFish API directly to scrape fresh civic data in real-time, then immediately imports it into your database.

## Quick Start

```bash
npm run prisma:scrape-live
```

## What It Does

1. **Scrapes 7 sources in real-time** using TinyFish API:
   - Tempe City Council (Priority 1)
   - Phoenix City Council (Priority 2)
   - Tempe Petitions (Priority 1)
   - Phoenix Petitions (Priority 2)
   - ASU Petitions (Priority 1)
   - Maricopa County Board (Priority 2)
   - Arizona State Legislature (Priority 3)

2. **Extracts complete data** with all required fields:
   - Title, summary, full description
   - Source URLs and action URLs
   - Deadlines and meeting dates
   - Categories and types
   - Support counts (for petitions)
   - Tags and organization info

3. **Filters for current/upcoming items only**:
   - Council meetings: Next 60 days only
   - Petitions: Currently open for signatures
   - Bills: Currently active (not passed/failed)

4. **Cleans and imports** into your database

## Advantages Over Dashboard Import

| Feature | Live Scraping | Dashboard Import |
|---------|--------------|------------------|
| **Speed** | 5-10 minutes | 30 seconds |
| **Data Freshness** | Real-time | Depends on when runs were created |
| **Control** | Full control over sources | Limited to existing runs |
| **Filtering** | Only current/upcoming items | All items from runs |
| **Customization** | Easy to modify prompts | Need to re-run agents |

## How It Works

### 1. SSE Streaming
Uses TinyFish's Server-Sent Events (SSE) endpoint for real-time progress:

```typescript
const response = await fetch('https://agent.tinyfish.ai/v1/automation/run-sse', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.TINYFISH_API_KEY!,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: source.url,
    goal: source.goal,
    output_schema: { /* JSON schema */ },
  }),
});
```

### 2. Progress Monitoring
Shows real-time status updates:
```
🔍 Scraping: Tempe City Council
   URL: https://www.tempe.gov/...
   Status: Navigating to page...
   Status: Extracting data...
   ✅ Scraping complete
   📊 Extracted 12 items
```

### 3. Smart Field Extraction
Prompts are optimized to return data in the exact format needed:
- Uses proper enum values (HOUSING, EDUCATION, etc.)
- Returns ISO date formats
- Includes all required fields
- NO placeholder text

### 4. Automatic Validation
- Skips items without title or URL
- Validates date formats
- Checks for duplicates
- Handles missing optional fields

## Customizing Sources

Edit `scripts/scrape-tinyfish-live.ts` to add/remove sources:

```typescript
const SCRAPING_SOURCES: ScrapingSource[] = [
  {
    name: 'Your Source Name',
    url: 'https://example.com',
    priority: 1, // 1 = high, 2 = medium, 3 = low
    goal: `Your detailed prompt here...`,
  },
  // ... more sources
];
```

## Prompt Best Practices

1. **Be specific about timeframes**:
   - "next 60 days only"
   - "currently open for signatures"
   - "active bills (not passed/failed)"

2. **Request exact field names**:
   - Use your schema field names exactly
   - Specify enum values explicitly
   - Request ISO date formats

3. **Filter out old/irrelevant items**:
   - "NO past meetings"
   - "NO closed petitions"
   - "ONLY upcoming events"

4. **Request complete descriptions**:
   - "200-500 words"
   - "include background and implications"
   - "explain community impact"

## Troubleshooting

### No items extracted
- Check that sources have current/upcoming items
- Verify TinyFish API key is correct
- Try running one source at a time

### Scraping fails
- Some government sites may block automated access
- Try enabling stealth mode (add to request body)
- Check if the URL is accessible

### Wrong data format
- Check the `output_schema` in the request
- Modify the prompt to be more specific
- Add examples of desired output format

### Rate limits
- Script includes 2-second delays between sources
- If you hit limits, reduce number of sources
- Or run sources in batches

## Output Example

```
🚀 Starting live TinyFish scraping...

🔍 Scraping: Tempe City Council
   URL: https://www.tempe.gov/...
   Status: Complete
   ✅ Scraping complete
   📊 Extracted 12 items
   ⏳ Waiting 2 seconds before next source...

🔍 Scraping: Tempe Petitions
   URL: https://www.change.org/...
   Status: Complete
   ✅ Scraping complete
   📊 Extracted 8 items

📊 Total items extracted: 87

⚠️  This will DELETE all existing civic items and insert new data.
Press Ctrl+C to cancel, or wait 5 seconds to continue...

🧹 Cleaning existing civic items...
✅ Database cleaned

📝 Inserting civic items...
  ✓ Inserted 10 items...
  ✓ Inserted 20 items...
  ...

🎉 Import complete!
   ✅ Inserted: 87 civic items
   ⚠️  Skipped: 0 items
```

## When to Use Each Script

### Use `npm run prisma:scrape-live` when:
- ✅ You want the freshest data
- ✅ You want to control which sources to scrape
- ✅ You want to filter for current/upcoming items only
- ✅ You're okay waiting 5-10 minutes

### Use `npm run prisma:import-tinyfish` when:
- ✅ You already have TinyFish runs on the dashboard
- ✅ You want to import quickly (30 seconds)
- ✅ You don't need to re-scrape
- ✅ You want to preserve historical data

### Use `npm run prisma:seed-tinyfish` when:
- ✅ You want the original implementation
- ✅ You need maximum control over scraping logic
- ✅ You want to customize extraction heavily

## Next Steps

After running the script:
1. Visit http://localhost:3000/discover to see your civic items
2. Test the swipe interface
3. Check http://localhost:3000/feed for the feed view
4. Verify all fields are populated correctly
5. Check that deadlines are current/upcoming
6. Verify action URLs work

## Tips for Best Results

- Run during business hours when government sites are most reliable
- Start with high-priority sources (priority: 1)
- Monitor the console output for errors
- If a source fails, you can comment it out and re-run
- Save successful results before experimenting with new sources
