# Smart Update System

The import script now intelligently handles duplicates by keeping the best version of each item based on data quality.

## How It Works

### 1. Quality Scoring (0-100 points)

Each civic item is scored based on:

| Criteria | Points | Details |
|----------|--------|---------|
| **Title Length** | 10 | 5 pts for >20 chars, 5 pts for >40 chars |
| **Summary Quality** | 20 | 10 pts for >20 words, 10 pts for >40 words |
| **Description Quality** | 30 | 10 pts for >50 words, 10 pts for >100 words, 10 pts for >200 words |
| **Has URL** | 10 | Source URL exists |
| **Has Deadline** | 5 | Deadline date exists |
| **Has Category** | 5 | Category is specified |
| **Has Tags** | 5 | Tags array exists and has items |
| **Has Support Numbers** | 5 | Target or current support exists |
| **Has Action URL** | 5 | Official action URL exists |

**Maximum Score:** 100 points

### 2. Deduplication Process

When multiple versions of the same item exist (same slug):

1. **Calculate quality score** for each version
2. **Compare scores** - higher score wins
3. **If scores are equal** - prefer the version from the latest TinyFish run
4. **Keep the best version** - discard others

### 3. Database Update Logic

For each item being imported:

```
IF item exists in database:
  Calculate quality score of existing item
  Calculate quality score of new item
  
  IF new item has higher quality:
    UPDATE existing item with new data
    Log: "Updated with better version"
  ELSE:
    SKIP new item
    Keep existing item
ELSE:
  INSERT new item
```

## Example Scenarios

### Scenario 1: Short Summary Gets Updated

**Existing in Database:**
```json
{
  "title": "HB2030: water conservation grant fund; education",
  "summary": "Removes education programs.",
  "fullDescription": "Removes education programs.",
  "quality_score": 35
}
```

**New from TinyFish:**
```json
{
  "title": "HB2030: Water Conservation Grant Fund Changes",
  "summary": "Removes education and research programs from eligible uses of the Water Conservation Grant Fund administered by WIFA. The bill narrows the fund's focus to direct water conservation projects...",
  "fullDescription": "HB2030 modifies the Water Conservation Grant Fund by eliminating education and research programs... (300 words)",
  "quality_score": 85
}
```

**Result:** ✅ Existing item is UPDATED with new version (quality 35 → 85)

### Scenario 2: Good Data Preserved

**Existing in Database:**
```json
{
  "title": "Tempe Affordable Housing Initiative",
  "summary": "Comprehensive 3-sentence summary with details...",
  "fullDescription": "Complete 400-word description...",
  "quality_score": 90
}
```

**New from TinyFish:**
```json
{
  "title": "Tempe Affordable Housing Initiative",
  "summary": "Short summary.",
  "fullDescription": "Short description.",
  "quality_score": 40
}
```

**Result:** ✅ Existing item is KEPT (quality 90 > 40), new version is skipped

### Scenario 3: Multiple Runs, Latest Wins

**Run 1 (older):**
```json
{
  "title": "Phoenix Transit Expansion",
  "summary": "Good summary...",
  "quality_score": 70
}
```

**Run 2 (newer):**
```json
{
  "title": "Phoenix Transit Expansion",
  "summary": "Good summary...",
  "quality_score": 70
}
```

**Result:** ✅ Version from Run 2 is kept (same quality, but newer)

## Benefits

### 1. Preserves Good Data
- Existing items with detailed descriptions aren't overwritten by poor quality data
- User engagements (comments, saves, supports) are preserved

### 2. Improves Data Quality Over Time
- Each import run can improve existing items
- Short summaries get replaced with detailed ones
- Missing fields get filled in

### 3. No Data Loss
- Good existing data is never deleted
- Only replaced when better version is available

### 4. Handles Multiple Sources
- Different TinyFish runs can contribute to the same item
- Best version from any source is kept

## Import Modes

### Smart Update Mode (Default)
```bash
npm run prisma:import-tinyfish
```

- Keeps existing items
- Updates items with better versions
- Adds new items
- Preserves user engagements

**Use when:**
- You want to improve existing data
- You have user activity you want to preserve
- You're running regular updates

### Clean Import Mode

Edit `scripts/import-tinyfish-runs.ts`:
```typescript
const cleanImport = true; // Change from false
```

Then run:
```bash
npm run prisma:import-tinyfish
```

- Deletes all existing items
- Imports fresh data
- Loses all user engagements

**Use when:**
- Starting fresh
- Major data structure changes
- Testing new prompts

## Monitoring Updates

The script provides detailed output:

```
🔄 Deduplicating and selecting best versions...
  Found 87 unique items (142 total before deduplication)
  ℹ️  Found 3 versions of "hb2030-water-conservation-grant-fund", keeping best version
  ✅ Deduplicated to 87 items

📝 Processing and inserting civic items...
  ✓ Inserted 10 items...
  🔄 Updated "HB2030: Water Conservation Grant..." with better version (quality: 35 → 85)
  ✓ Inserted 20 items...

🎉 Import complete!
   ✅ Inserted: 45 new civic items
   🔄 Updated: 12 existing items with better versions
   ⚠️  Skipped: 30 items

📊 Skip reasons:
   - No title: 0
   - No URL: 2
   - Expired deadline: 15
   - Invalid data: 13
```

## Best Practices

### 1. Run Regular Updates
```bash
# Weekly or after new TinyFish runs
npm run prisma:import-tinyfish
```

This gradually improves data quality without losing user activity.

### 2. Check Update Log
Look for lines like:
```
🔄 Updated "..." with better version (quality: 35 → 85)
```

This shows which items were improved.

### 3. Verify Quality Improvements
After import, check a few updated items in the app to verify:
- Summaries are more detailed
- Descriptions are complete
- All fields are populated

### 4. Adjust Quality Scoring
If updates aren't working as expected, adjust the scoring in `calculateItemQuality()`:

```typescript
// Give more weight to descriptions
if (descWords > 200) score += 20; // was 10

// Or less weight to titles
if (title.length > 40) score += 2; // was 5
```

## Troubleshooting

### Items Not Getting Updated

**Problem:** Existing items have short summaries but aren't being updated

**Check:**
1. Is the new version actually better? Check quality scores in logs
2. Are the slugs matching? (titles must be similar)
3. Is the new data being extracted properly?

**Solution:**
- Improve TinyFish prompts to extract better data
- Adjust quality scoring weights
- Or use Clean Import mode once to reset

### Too Many Updates

**Problem:** Good existing items are being replaced

**Check:**
1. Are new items actually better quality?
2. Is quality scoring working correctly?

**Solution:**
- Adjust quality scoring to value existing data more
- Increase weights for fields that matter most

### Duplicates Still Appearing

**Problem:** Same item appears multiple times

**Check:**
1. Are titles different enough to create different slugs?
2. Are items from different sources?

**Solution:**
- Improve title normalization in `shortenTitle()`
- Add more aggressive slug deduplication
- Manually merge in database if needed

## Technical Details

### Slug Generation
```typescript
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .substring(0, 100);
```

Items with the same slug are considered duplicates.

### Quality Calculation
See `calculateItemQuality()` function in `scripts/import-tinyfish-runs.ts`

### Update vs Insert
- **Update:** `prisma.civicItem.update()` - preserves ID, keeps relationships
- **Insert:** `prisma.civicItem.create()` - creates new record

## Future Enhancements

Potential improvements:
- [ ] User-configurable quality weights
- [ ] Merge strategy (combine best fields from multiple versions)
- [ ] Quality score threshold (only update if improvement is significant)
- [ ] Backup before update
- [ ] Rollback capability
- [ ] Quality score displayed in admin panel
