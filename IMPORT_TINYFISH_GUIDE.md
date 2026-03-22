# Import TinyFish Dashboard Data

This guide shows you how to import civic data from your existing TinyFish dashboard runs into RallyPoint.

## Overview

Instead of running new scraping jobs, this script fetches all completed runs from your TinyFish dashboard and imports the extracted data directly into your database.

## Prerequisites

- TinyFish API key in `.env` file
- Existing TinyFish runs with completed data on your dashboard

## How It Works

1. **Fetches all runs** from TinyFish API using pagination
2. **Filters completed runs** with valid results (no errors)
3. **Extracts civic data** from various result structures
4. **Cleans database** (deletes existing civic items)
5. **Processes and inserts** civic items with smart field mapping

## Usage

```bash
npm run prisma:import-tinyfish
```

## What Gets Imported

The script intelligently extracts civic data from your TinyFish runs, looking for:

- **Title/Name**: Item title or name
- **Description**: Summary, details, or description
- **URL**: Source link to the civic item
- **Deadline**: Meeting date, deadline, or event date
- **Location**: Address or location information
- **Organization**: Agency, department, or organization name
- **Tags**: Any categorization tags
- **AI Summary**: Pre-generated summaries

## Smart Field Mapping

The script handles various TinyFish result structures:

```typescript
// Array of items
{ result: [...] }

// Nested data property
{ result: { data: [...] } }

// Items property
{ result: { items: [...] } }

// Single object
{ result: { title: "...", url: "..." } }
```

## Category & Type Inference

The script automatically categorizes items based on keywords:

**Categories:**
- EDUCATION (school, university)
- TRANSPORTATION (transit, traffic)
- ENVIRONMENT (climate, sustainability)
- HEALTHCARE (medical, hospital)
- HOUSING (zoning, development)
- PUBLIC_SAFETY (police, fire)
- BUDGET (tax, finance)
- OTHER (default)

**Types:**
- MEETING (hearing, session)
- LEGISLATION (bill, law)
- PETITION (initiative)
- PROJECT (development, construction)
- BUDGET (funding)
- OTHER (default)

## Data Quality

The script:
- ✅ Skips items without title or URL
- ✅ Prevents duplicates using slug matching
- ✅ Validates dates before parsing
- ✅ Handles missing fields gracefully
- ✅ Logs progress and errors

## Output Example

```
📥 Fetching runs from TinyFish dashboard...
  ✓ Fetched 25 runs (total: 25/25)

✅ Fetched 25 total runs
✅ Found 18 completed runs with results

📊 Extracted 142 civic items from runs

⚠️  This will DELETE all existing civic items and insert new data from TinyFish.
Press Ctrl+C to cancel, or wait 5 seconds to continue...

🧹 Cleaning existing civic items...
✅ Database cleaned

📝 Processing and inserting civic items...
  ✓ Inserted 10 items...
  ✓ Inserted 20 items...
  ...

🎉 Import complete!
   ✅ Inserted: 87 civic items
   ⚠️  Skipped: 55 items (duplicates or invalid data)
```

## Troubleshooting

### No completed runs found
- Check your TinyFish dashboard to ensure you have completed runs
- Verify your API key is correct in `.env`

### No civic data extracted
- Your TinyFish runs may have different result structures
- Check the console output to see what data was found
- You may need to customize the `extractCivicData()` function

### Items skipped
- Items without title or URL are automatically skipped
- Duplicate slugs are skipped (based on title)
- Invalid dates are set to null

## Customization

To handle custom TinyFish result structures, edit `scripts/import-tinyfish-runs.ts`:

```typescript
function extractCivicData(run: TinyFishRun): any[] {
  // Add your custom extraction logic here
  if (run.result.your_custom_field) {
    return run.result.your_custom_field;
  }
  // ... existing logic
}
```

## Comparison with Scraping

| Method | Time | Data Source | Use Case |
|--------|------|-------------|----------|
| **Import Dashboard** | ~30 seconds | Existing runs | Quick import of already-scraped data |
| **Run New Scraping** | 10-15 minutes | Live websites | Fresh data from government sources |

## Next Steps

After importing:
1. Visit http://localhost:3000/discover to see your civic items
2. Test the swipe interface
3. Check http://localhost:3000/feed for the feed view
4. Verify data quality and adjust category/type inference if needed
