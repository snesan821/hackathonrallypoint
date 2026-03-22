# 🐟 TinyFish Real Data - Quick Start Guide

## 🎯 Goal
Replace hardcoded fallback data with real civic issues scraped from government sources.

## 🚀 Quick Start

### Step 1: Set Environment Variables

Make sure your `.env` file has:

```bash
# Required
DATABASE_URL="postgresql://..."

# Optional (for AI enrichment)
ANTHROPIC_API_KEY="sk-ant-..."
```

### Step 2: Run the Improved Seed Script

```bash
npm run prisma:seed-tinyfish
```

This will:
- ✅ Clean the database
- ✅ Scrape 10+ government sources
- ✅ Extract civic items with better parsing
- ✅ Enrich data with Claude AI (if API key provided)
- ✅ Validate and score data quality
- ✅ Insert only high-quality items (score >= 50)

### Step 3: Check the Results

```bash
# Open Prisma Studio to view the data
npm run prisma:studio
```

Or check your app at `http://localhost:3000/discover`

## 📊 What Gets Scraped

### Data Sources (10+ sources)

**Priority 5 (Most Important):**
- Tempe City Council agendas
- Arizona Legislature bills

**Priority 4:**
- Tempe development projects
- Maricopa County ballot measures

**Priority 3:**
- Maricopa County Board agendas
- ASU student petitions
- Phoenix City Council agendas

**Priority 2:**
- ASU USG legislation
- Mesa City Council agendas
- Scottsdale City Council agendas

### Data Quality Scoring

Each item gets a quality score (0-100):

- **90-100**: Excellent (complete data, all fields)
- **70-89**: Good (most fields, minor gaps)
- **50-69**: Acceptable (basic fields, some gaps)
- **< 50**: Poor (rejected, not inserted)

**Scoring Criteria:**
- Title length: 0-20 points
- Summary length: 0-30 points
- Has source URL: 20 points
- Has deadline: 15 points
- Has full description: 15 points

## 🔍 What You'll See

### Console Output

```
🌱 RallyPoint Seed — Improved TinyFish Scraping

📡 Configured 10 data sources
🔑 TinyFish API Key: sk-tinyfish-iWUhyV0z...
🤖 Claude Available: Yes

🧹 Cleaning database...
✅ Database cleaned

✅ System user created

🐟 Scraping [Priority 5]: https://www.tempe.gov/government/agendas-and-minutes
   Goal: Extract recent Tempe City Council agenda items...
   📡 Received 45 events
   ✅ Extracted 8 items from last event

🐟 Scraping [Priority 5]: https://apps.azleg.gov/BillStatus/BillOverview
   Goal: Extract recent Arizona bills...
   📡 Received 52 events
   ✅ Extracted 10 items from event #48

📊 Total scraped items: 45
✅ High quality items (score >= 50): 38
⚠️ Low quality items (score < 50): 7

💾 Inserting 38 items into database...

   ✅ [Score: 85] Tempe City Council Regular Meeting — March 26, 2026
   ✅ [Score: 92] HB 2001: Arizona School Safety and Mental Health Act
   ✅ [Score: 78] Tempe Affordable Housing Trust Fund Allocation
   ...

🎉 Successfully inserted 38 civic items!

📈 Quality Distribution:
   90-100: 12 items
   70-89:  18 items
   50-69:  8 items
```

## 🎨 Features

### 1. Better Extraction Logic
- Recursive search for arrays in nested objects
- Multiple fallback strategies
- Handles various JSON structures
- Extracts from strings containing JSON

### 2. Smart Inference
- **Category**: Infers from keywords (housing, education, transit, etc.)
- **Type**: Infers from context (petition, bill, hearing, etc.)
- **Tags**: Extracts relevant tags automatically
- **Jurisdiction**: Based on source configuration

### 3. AI Enrichment (Optional)
If `ANTHROPIC_API_KEY` is set, Claude will:
- Expand short summaries to 150-250 words
- Infer missing deadlines
- Suggest relevant tags
- Improve data quality

### 4. Quality Validation
- Validates required fields
- Scores data quality
- Rejects low-quality items
- Logs quality distribution

## 📋 Expected Results

### Quantity
- **Target**: 30-50 civic items
- **Actual**: Varies by source availability
- **Minimum**: 20 items (with fallback)

### Quality
- **Average Score**: 70-80
- **High Quality (90+)**: 20-30%
- **Good Quality (70-89)**: 40-50%
- **Acceptable (50-69)**: 20-30%

### Coverage
- ✅ Multiple jurisdictions (Tempe, Phoenix, Mesa, Scottsdale, Maricopa County, Arizona, ASU)
- ✅ Multiple levels (City, County, State, Campus)
- ✅ Multiple types (Bills, Agendas, Petitions, Hearings, Measures)
- ✅ Multiple categories (Housing, Education, Transit, Environment, etc.)

## 🔧 Troubleshooting

### "No items scraped"

**Possible causes:**
- TinyFish API timeout
- Source websites changed structure
- Network issues

**Solutions:**
1. Check TinyFish API key is correct
2. Try running again (sources may be temporarily unavailable)
3. Check console output for specific errors
4. Verify internet connection

### "Low quality scores"

**Possible causes:**
- Scraped data has minimal information
- Missing summaries or descriptions
- No source URLs

**Solutions:**
1. Enable Claude enrichment (set `ANTHROPIC_API_KEY`)
2. Adjust quality threshold in script
3. Add more data sources
4. Improve extraction logic for specific sources

### "Claude enrichment failed"

**Possible causes:**
- Missing or invalid `ANTHROPIC_API_KEY`
- API rate limits
- Network issues

**Solutions:**
1. Verify `ANTHROPIC_API_KEY` in `.env`
2. Check Anthropic API status
3. Script will continue without enrichment (lower quality scores)

### "Database errors"

**Possible causes:**
- Invalid data format
- Duplicate slugs
- Missing required fields

**Solutions:**
1. Check console output for specific error
2. Verify database connection
3. Run `npm run prisma:generate` to update Prisma client
4. Check Prisma Studio for data issues

## 🎯 Next Steps

### Immediate (This Week)
1. ✅ Run the improved seed script
2. ✅ Verify data quality in Prisma Studio
3. ✅ Test user-facing display
4. ✅ Adjust quality thresholds if needed

### Short Term (Next Week)
1. Add more data sources (5-10 more)
2. Improve extraction for specific sources
3. Create admin dashboard for data quality
4. Set up monitoring and alerts

### Long Term (Next Month)
1. Implement scheduled scraping (daily updates)
2. Add webhook integration for real-time updates
3. Create data validation pipeline
4. Build admin tools for manual review

## 📚 Resources

### Documentation
- [TinyFish Implementation Plan](./TINYFISH_IMPLEMENTATION_PLAN.md) - Complete technical plan
- [Prisma Schema](./prisma/schema.prisma) - Database structure
- [Seed Script](./prisma/seed-tinyfish-improved.ts) - Source code

### APIs
- TinyFish API: https://agent.tinyfish.ai
- Anthropic Claude: https://www.anthropic.com

### Data Sources
- Tempe: https://www.tempe.gov
- Arizona Legislature: https://apps.azleg.gov
- Maricopa County: https://www.maricopa.gov
- ASU: https://eoss.asu.edu

## 💡 Tips

1. **Run during off-peak hours**: Scraping takes 5-10 minutes
2. **Enable Claude enrichment**: Significantly improves quality
3. **Check quality distribution**: Aim for 70+ average score
4. **Monitor source changes**: Websites may update structure
5. **Add more sources**: More sources = more diverse content
6. **Validate manually**: Spot-check a few items for accuracy

## 🎉 Success Criteria

You'll know it's working when:
- ✅ 30+ items inserted into database
- ✅ Average quality score > 70
- ✅ Items appear in Discover page
- ✅ Source URLs are clickable and valid
- ✅ Summaries are readable and informative
- ✅ Categories and types are accurate
- ✅ Deadlines are reasonable (if present)

## 🆘 Need Help?

If you encounter issues:
1. Check console output for errors
2. Review [TINYFISH_IMPLEMENTATION_PLAN.md](./TINYFISH_IMPLEMENTATION_PLAN.md)
3. Verify environment variables
4. Check TinyFish API status
5. Try running with fewer sources first
6. Enable verbose logging in script

---

**Ready to get real data?** Run `npm run prisma:seed-tinyfish` now! 🚀
