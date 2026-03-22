# Clean Low-Quality Civic Items

This script analyzes and removes civic items with poor quality summaries, vague headings, and minimal content using a point-based scoring system.

## Quality Scoring System

Each civic item starts with a score of 100 points. Points are deducted based on quality issues:

### Title Quality (-0 to -65 points)

- **Vague patterns** (-30): Titles like "word; word; word" or "adjective noun fund"
- **Excessive semicolons** (-20): 2+ semicolons indicate list-style titles
- **Vague keywords** (-15): 3+ generic words like "fund", "appropriation", "certificate"
- **Too short** (-10): Titles under 30 characters

### Summary Quality (-0 to -110 points)

- **Extremely short** (-40): Under 50 characters
- **Very short** (-25): 50-100 characters
- **Short** (-10): 100-150 characters
- **One sentence** (-30): Summary is only one sentence
- **Two sentences** (-15): Summary is only two sentences
- **Title overlap** (-25): Summary 70%+ overlap with title (just restating)
- **Generic phrases** (-15): Uses phrases like "provides an appropriation", "concerns", "relates to"

### Content Completeness (-0 to -15 points)

- **Missing description** (-10): No full description or under 100 characters
- **No AI summary** (-5): Missing AI-generated summary

### Engagement Bonus (+20 points)

- Items with user engagement (supports, comments, or 5+ views) get +20 points
- Items with engagement are NEVER deleted regardless of score

## Deletion Criteria

Items are deleted if:
- Quality score < 40 points
- AND no user engagement (0 supports, 0 comments, <5 views)

## Examples from Screenshots

Based on the screenshots provided, these would be flagged for deletion:

1. **"rural water sustainability fund; appropriation"**
   - Vague pattern (-30)
   - 2 semicolons (-20)
   - 3 vague keywords (-15)
   - One sentence summary (-30)
   - Generic phrase "Provides an appropriation" (-15)
   - **Score: ~0/100** → DELETE

2. **"multifamily property; water; certificate"**
   - Vague pattern (-30)
   - 2 semicolons (-20)
   - 3 vague keywords (-15)
   - One sentence summary (-30)
   - Generic phrase "Concerns" (-15)
   - **Score: ~0/100** → DELETE

3. **"health care; premiums; insurance; dialysis"**
   - Vague pattern (-30)
   - 3 semicolons (-20)
   - 4 vague keywords (-15)
   - One sentence summary (-30)
   - Generic phrase "Relates to" (-15)
   - **Score: ~-10/100** → DELETE

4. **"water conservation grant fund; education"**
   - Vague pattern (-30)
   - 1 semicolon (no penalty)
   - 3 vague keywords (-15)
   - One sentence summary (-30)
   - Generic phrase "A measure related to" (-15)
   - **Score: ~10/100** → DELETE

## Usage

### Dry Run (Recommended First)

Analyze items without deleting:

```bash
pnpm clean-items
```

This will:
- Analyze all civic items
- Show which items would be deleted
- Display quality scores and reasons
- Show statistics

### Execute Deletion

After reviewing the dry run results, execute the deletion:

```bash
pnpm clean-items:execute
```

⚠️ **WARNING**: This permanently deletes items from the database!

## Output Example

```
🔍 Analyzing civic items for quality...

📊 Total items in database: 150

❌ Items to delete: 23
✅ Items to keep: 127

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ITEMS TO DELETE (sorted by quality score)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Score: 0/100
   Title: "rural water sustainability fund; appropriation"
   Summary: "Provides an appropriation for a fund dedicated to rural water sustainability."
   Slug: rural-water-sustainability-fund-appropriation
   Reasons:
     - Title follows vague pattern (e.g., "word; word; word")
     - Title has 1 semicolons (list-style)
     - Title contains 3 vague keywords
     - Summary very short (78 chars)
     - Summary is only one sentence
     - Summary uses generic phrases
     - Missing or minimal full description
     - No AI summary available

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 SUMMARY STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total items analyzed: 150
Items to delete: 23 (15.3%)
Items to keep: 127 (84.7%)
Low-quality items kept (engagement): 5
Average quality score: 62.4/100
Average score after cleanup: 71.8/100
```

## Safety Features

1. **Dry run by default**: Must explicitly use `--execute` flag to delete
2. **Engagement protection**: Items with user engagement are never deleted
3. **Detailed reporting**: Shows exactly what will be deleted and why
4. **Score transparency**: Clear point deductions for each quality issue

## Customization

To adjust the scoring criteria, edit `scripts/clean-low-quality-items.ts`:

- Modify `VAGUE_KEYWORDS` array to add/remove generic terms
- Adjust point deductions in `calculateQualityScore()` function
- Change deletion threshold (currently 40 points)

## Best Practices

1. **Always run dry run first** to review what will be deleted
2. **Check low-quality kept items** - these have engagement but poor quality
3. **Consider manual review** for items with scores 30-50
4. **Run periodically** to maintain database quality
5. **Backup database** before executing deletion

## Related Scripts

- `pnpm prisma:studio` - View database in GUI
- `pnpm prisma:seed` - Re-seed database if needed
- `pnpm reset-all-users` - Reset user data
