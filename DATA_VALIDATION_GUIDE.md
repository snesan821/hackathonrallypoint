# Data Validation & Transformation Guide

This document explains how RallyPoint ensures all civic data meets quality standards, whether from new TinyFish runs or existing data.

## Validation Pipeline

When you run `npm run prisma:import-tinyfish`, the script applies these validations and transformations:

### 1. Title Validation & Shortening

**Rule:** Titles must be max 80 characters for proper card display

**Transformations:**
- Removes common prefixes: "Proposed", "Discussion on", "Meeting about", "Regarding", "Re:", "About"
- Removes articles: "A", "An", "The"
- Truncates at word boundary if still too long
- Adds "..." if truncated

**Examples:**
```
Before: "Proposed Discussion on Zoning Change for Mill Avenue Development Project"
After:  "Zoning Change for Mill Avenue Development Project"

Before: "Meeting about the Affordable Housing Initiative and Rent Control Measures for Downtown Tempe Residents"
After:  "Affordable Housing Initiative and Rent Control Measures for Downtown..."
```

### 2. Category Validation

**Rule:** Must be one of 12 valid categories for color-coded badges

**Valid Categories:**
- HOUSING (blue)
- EDUCATION (purple)
- TRANSIT (green)
- PUBLIC_SAFETY (red)
- HEALTHCARE (pink)
- JOBS (amber)
- ENVIRONMENT (emerald)
- CIVIL_RIGHTS (indigo)
- CITY_SERVICES (cyan)
- BUDGET (yellow)
- ZONING (orange)
- OTHER (gray)

**Process:**
1. If TinyFish provides a category, validate it's in the list
2. If invalid or missing, infer from title + description using keyword matching
3. Default to OTHER if no match

**Keyword Matching:**
- Housing: housing, rent, tenant, landlord, affordable, homeless, shelter, apartment
- Education: education, school, student, teacher, curriculum, college, university
- Transit: transit, transport, bus, train, rail, bike, pedestrian, traffic, road
- Public Safety: police, fire, emergency, safety, crime, security
- Healthcare: health, medical, hospital, clinic, mental health, wellness
- Jobs: job, employment, wage, worker, labor, unemployment, career
- Environment: environment, climate, green, sustainability, pollution, conservation
- Civil Rights: civil rights, equality, discrimination, justice, voting, rights
- City Services: utility, water, sewer, waste, garbage, service, infrastructure
- Budget: budget, tax, fiscal, spending, revenue, finance, funding
- Zoning: zoning, development, construction, building, land use, planning

### 3. Type Validation

**Rule:** Must be one of 9 valid types

**Valid Types:**
- PETITION
- BALLOT_INITIATIVE
- ORDINANCE
- PUBLIC_HEARING
- COUNCIL_VOTE
- SCHOOL_BOARD
- STATE_BILL
- CITY_POLICY
- OTHER

**Process:**
1. Validate TinyFish-provided type
2. Infer from content if missing/invalid
3. Default to OTHER

### 4. Deadline Validation

**Rule:** Deadlines must be in the FUTURE (after March 22, 2026)

**Process:**
1. Parse deadline from various field names (deadline, date, meeting_date, dueDate)
2. Check if date is after March 22, 2026
3. If in the past, **SKIP THE ENTIRE ITEM** (don't import expired items)
4. If no deadline, set to null (allowed for petitions)

**Why This Matters:**
- Users should only see items they can currently act on
- No expired meetings, closed petitions, or past events
- Keeps the platform feeling active and current

### 5. Summary Normalization

**Rule:** Summary should be 150-200 words (displays on cards with "Read more" button)

**Process:**
1. Use provided summary if available
2. If too short (<30 words), expand from fullDescription
3. If too long (>60 words), truncate to ~50 words
4. Add "..." if truncated

**Result:** Consistent card display with collapsible summaries

### 6. Full Description Normalization

**Rule:** Full description should be 300-500 words (displays on detail page)

**Process:**
1. Use provided fullDescription if available
2. If too short (<100 words), combine with summary
3. If too long (>600 words), truncate to 500 words
4. Add "..." if truncated

**Result:** Detailed information without overwhelming users

### 7. Required Field Validation

**Required Fields:**
- title (must exist and not be "Untitled")
- sourceUrl (must exist)

**Process:**
- If either is missing, **SKIP THE ITEM**
- Log the skip reason for debugging

### 8. Duplicate Detection

**Rule:** No duplicate slugs (generated from title)

**Process:**
1. Generate slug from title (lowercase, dashes, max 100 chars)
2. Check if slug already exists in database
3. If duplicate, skip the item

**Why:** Prevents importing the same item multiple times

## Skip Reasons Report

After import, you'll see a breakdown of why items were skipped:

```
📊 Skip reasons:
   - No title: 2
   - No URL: 5
   - Expired deadline: 12
   - Duplicate: 8
   - Invalid data: 3
```

This helps you understand data quality and adjust TinyFish prompts if needed.

## How This Ensures Quality

### For New Data (from TinyFish):
1. TinyFish prompts request proper format
2. Import script validates and transforms
3. Only quality data enters database

### For Old Data (existing runs):
1. Import script applies same validations
2. Expired items are filtered out
3. Titles are shortened
4. Categories are validated/inferred
5. Summaries are normalized

### Result:
- ✅ All items have color-coded category badges
- ✅ All items are current/active (no expired)
- ✅ All titles fit on cards (max 80 chars)
- ✅ All summaries are consistent length
- ✅ All categories are valid for filtering

## Testing the Validation

To test the validation logic:

1. Run TinyFish agents with the new prompts
2. Run `npm run prisma:import-tinyfish`
3. Check the console output for:
   - How many items were inserted
   - How many were skipped and why
   - Any validation warnings

4. Visit the app and verify:
   - All cards have colored category badges
   - All titles are short and readable
   - No expired deadlines are shown
   - Summaries are consistent length
   - "Read more" buttons work

## Updating Existing Data

If you already have data in the database and want to apply these validations:

1. Export your current data (optional backup)
2. Run new TinyFish agents with updated prompts
3. Run `npm run prisma:import-tinyfish`
4. The script will:
   - Delete all existing civic items
   - Import fresh data with validations
   - Apply all transformations

**Note:** This is destructive! All existing civic items, comments, and engagements will be deleted.

## Customizing Validations

To adjust validation rules, edit `scripts/import-tinyfish-runs.ts`:

### Change Title Length:
```typescript
function shortenTitle(title: string): string {
  const MAX_LENGTH = 100; // Change from 80
  // ... rest of function
}
```

### Add New Category Keywords:
```typescript
function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  
  // Add new keywords
  if (lower.match(/\b(your|new|keywords)\b/)) return 'YOUR_CATEGORY';
  
  // ... existing logic
}
```

### Adjust Summary Length:
```typescript
function normalizeSummary(summary: string, fullDescription: string): string {
  // Change word counts
  if (words.length < 40) { // was 30
    // ...
  }
  if (words.length > 80) { // was 60
    return words.slice(0, 60).join(' ') + '...'; // was 50
  }
}
```

## Best Practices

1. **Run TinyFish with updated prompts** - The prompts in `TINYFISH_COPY_PASTE_PROMPTS.md` are designed to provide data in the correct format

2. **Check skip reasons** - If many items are skipped, adjust your TinyFish prompts

3. **Verify categories** - Check that inferred categories match your expectations

4. **Test with small batches** - Run one TinyFish source at a time to verify quality

5. **Monitor deadlines** - Ensure TinyFish is extracting future dates correctly

## Troubleshooting

### Too many items skipped for "expired deadline"
- TinyFish is extracting past meetings
- Update prompts to explicitly request "AFTER March 22, 2026"
- Check that TinyFish is parsing dates correctly

### Wrong categories assigned
- Keywords may not match your content
- Add more specific keywords to `inferCategory()`
- Or ensure TinyFish prompts request explicit categories

### Titles still too long
- Reduce MAX_LENGTH in `shortenTitle()`
- Or update TinyFish prompts to request shorter titles

### Summaries inconsistent
- Adjust word counts in `normalizeSummary()`
- Or update TinyFish prompts for better summary format
