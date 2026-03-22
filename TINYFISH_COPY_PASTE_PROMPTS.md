# TinyFish Copy-Paste Prompts - Optimized for RallyPoint

These prompts are designed to extract civic data that displays perfectly in RallyPoint's UI with color-coded category badges, active/current items only, and proper title/summary formatting.

## Important Requirements

### Categories (for color-coded badges):
- HOUSING (blue) - Rent control, affordable housing, tenant rights
- EDUCATION (purple) - School funding, curriculum, college affordability
- TRANSIT (green) - Public transportation, bike lanes, walkability
- PUBLIC_SAFETY (red) - Police, fire services, emergency response
- HEALTHCARE (pink) - Mental health, community health, access to care
- JOBS (amber) - Employment, minimum wage, worker protections
- ENVIRONMENT (emerald) - Climate, conservation, sustainability
- CIVIL_RIGHTS (indigo) - Equity, discrimination, voting rights
- CITY_SERVICES (cyan) - Parks, utilities, waste management
- BUDGET (yellow) - Municipal budgets, taxes, fiscal policy
- ZONING (orange) - Land use, construction, urban planning
- OTHER (gray) - Other civic issues

### Title Guidelines:
- Keep titles SHORT and CONCISE (max 80 characters)
- Remove redundant words like "Proposed", "Discussion on", "Meeting about"
- Example: "Proposed Zoning Change for Mill Avenue Development" → "Mill Avenue Development Zoning Change"

### Summary vs Full Description:
- **summary**: 2-3 sentences (150-200 words) - displays on cards with "Read more" button
- **fullDescription**: Complete details (300-500 words) - displays on detail page

### Active Items Only:
- NO expired deadlines (must be future dates)
- NO passed/failed legislation
- NO closed petitions
- ONLY items users can currently act on

---

## 1. Tempe City Council Agendas

**URL:** `https://tempe.hylandcloud.com/AgendaOnline`

**Prompt:**
```
Go to Tempe's agenda system and find City Council meetings scheduled in the NEXT 60 DAYS ONLY (after March 22, 2026). Click on each upcoming meeting to view agenda items.

For each agenda item, extract:

REQUIRED FIELDS:
- title: SHORT concise title (max 80 chars). Remove "Proposed", "Discussion on", etc. Example: "Mill Avenue Zoning Change" not "Discussion on Proposed Zoning Change for Mill Avenue"
- summary: 2-3 sentences (150-200 words) explaining what this is and why it matters
- fullDescription: Complete 300-500 word description including background, details, community impact, and what would change if passed
- sourceUrl: Direct URL to this meeting on tempe.hylandcloud.com
- deadline: Meeting date in ISO format (YYYY-MM-DDTHH:mm:ssZ) - MUST be after March 22, 2026
- category: Choose ONE that fits best: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- type: Choose ONE: PUBLIC_HEARING, COUNCIL_VOTE, ORDINANCE, CITY_POLICY
- jurisdiction: "Tempe, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: "https://www.tempe.gov/government/city-clerk-s-office/council-meeting-information"
- allowsOnlineSignature: true
- tags: Array of 3-5 specific keywords (e.g., ["affordable housing", "downtown", "zoning"])
- organizationName: "Tempe City Council"
- organizationUrl: "https://www.tempe.gov"

CRITICAL RULES:
- ONLY include meetings AFTER March 22, 2026
- NO past meetings
- Titles must be SHORT (max 80 chars)
- Category must be ONE of the 12 listed above
- Return as JSON array
```

---

## 2. Tempe Public Meetings

**URL:** `https://www.tempe.gov/government/city-clerk-s-office/public-meeting-schedules-agendas-and-minutes`

**Prompt:**
```
Find upcoming Tempe public meetings, hearings, and commission meetings scheduled AFTER March 22, 2026 (next 60 days).

For each meeting:
- title: SHORT concise title (max 80 chars)
- summary: 2-3 sentences (150-200 words)
- fullDescription: 300-500 words about what will be discussed and community impact
- sourceUrl: Direct URL
- deadline: Meeting date ISO format - MUST be after March 22, 2026
- category: ONE of: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- type: PUBLIC_HEARING, COUNCIL_VOTE, ORDINANCE, or CITY_POLICY
- jurisdiction: "Tempe, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: "https://www.tempe.gov/government/city-clerk-s-office/council-meeting-information"
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "City of Tempe"
- organizationUrl: "https://www.tempe.gov"

ONLY future meetings. Return as JSON array.
```

---

## 3. Tempe Petitions (Change.org)

**URL:** `https://www.change.org/search?q=tempe%20arizona`

**Prompt:**
```
Find ACTIVE petitions about Tempe, Arizona that are CURRENTLY OPEN for signatures (not closed, not won).

For each ACTIVE petition:
- title: SHORT concise title (max 80 chars) - remove "Petition to" or "We demand"
- summary: First 2-3 sentences from petition (150-200 words)
- fullDescription: Complete petition text (300-500 words) including why it started, what it's asking for, and who it affects
- sourceUrl: Direct petition URL (the actual petition page, not search results)
- deadline: null (most petitions don't have deadlines)
- category: Choose ONE that fits best: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- type: "PETITION"
- jurisdiction: "Tempe, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: Same as sourceUrl
- targetSupport: Signature goal number
- currentSupport: Current signature count
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords from petition
- organizationName: Petition creator's name
- organizationUrl: null

CRITICAL: ONLY petitions currently accepting signatures. NO closed or won petitions. Return as JSON array.
```

---

## 4. Phoenix City Council

**URL:** `https://phoenix.legistar.com/Calendar.aspx`

**Prompt:**
```
Find Phoenix City Council meetings scheduled AFTER March 22, 2026 (next 60 days). Click on upcoming meetings to see agenda items.

For each agenda item:
- title: SHORT concise title (max 80 chars)
- summary: 2-3 sentences (150-200 words)
- fullDescription: 300-500 words
- sourceUrl: Direct URL on phoenix.legistar.com
- deadline: Meeting date ISO format - MUST be after March 22, 2026
- category: ONE of: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- type: PUBLIC_HEARING, COUNCIL_VOTE, ORDINANCE, or CITY_POLICY
- jurisdiction: "Phoenix, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: "https://phoenix.legistar.com"
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "Phoenix City Council"
- organizationUrl: "https://www.phoenix.gov"

ONLY future meetings. Return as JSON array.
```

---

## 5. Phoenix Petitions

**URL:** `https://www.change.org/search?q=phoenix%20arizona`

**Prompt:**
```
Find ACTIVE petitions about Phoenix, Arizona currently open for signatures.

For each ACTIVE petition:
- title: SHORT concise title (max 80 chars)
- summary: 2-3 sentences (150-200 words)
- fullDescription: 300-500 words
- sourceUrl: Direct petition URL
- deadline: null
- category: ONE of: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
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

ONLY active petitions. Return as JSON array.
```

---

## 6. Mesa City Council

**URL:** `https://www.mesaaz.gov/government/city-council/agendas-minutes`

**Prompt:**
```
Find Mesa City Council meetings scheduled AFTER March 22, 2026 (next 60 days).

For each agenda item:
- title: SHORT concise title (max 80 chars)
- summary: 2-3 sentences (150-200 words)
- fullDescription: 300-500 words
- sourceUrl: Direct URL
- deadline: Meeting date ISO format - MUST be after March 22, 2026
- category: ONE of: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- type: PUBLIC_HEARING, COUNCIL_VOTE, ORDINANCE, or CITY_POLICY
- jurisdiction: "Mesa, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: URL for public comments
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "Mesa City Council"
- organizationUrl: "https://www.mesaaz.gov"

ONLY future meetings. Return as JSON array.
```

---

## 7. Scottsdale City Council

**URL:** `https://eservices.scottsdaleaz.gov/cityclerk/PlannedAgendas`

**Prompt:**
```
Find Scottsdale City Council meetings scheduled AFTER March 22, 2026 (next 60 days).

For each agenda item:
- title: SHORT concise title (max 80 chars)
- summary: 2-3 sentences (150-200 words)
- fullDescription: 300-500 words
- sourceUrl: Direct URL
- deadline: Meeting date ISO format - MUST be after March 22, 2026
- category: ONE of: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- type: PUBLIC_HEARING, COUNCIL_VOTE, ORDINANCE, or CITY_POLICY
- jurisdiction: "Scottsdale, AZ"
- jurisdictionLevel: "CITY"
- officialActionUrl: "https://www.scottsdaleaz.gov/council/meeting-information"
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "Scottsdale City Council"
- organizationUrl: "https://www.scottsdaleaz.gov"

ONLY future meetings. Return as JSON array.
```

---

## 8. ASU Petitions

**URL:** `https://www.change.org/search?q=asu%20arizona%20state%20university`

**Prompt:**
```
Find ACTIVE petitions about Arizona State University currently open for signatures.

For each ACTIVE petition:
- title: SHORT concise title (max 80 chars)
- summary: 2-3 sentences (150-200 words)
- fullDescription: 300-500 words
- sourceUrl: Direct petition URL
- deadline: null
- category: Usually EDUCATION or CIVIL_RIGHTS, but choose best fit from: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- type: "PETITION"
- jurisdiction: "Arizona State University, Tempe"
- jurisdictionLevel: "CAMPUS"
- officialActionUrl: Same as sourceUrl
- targetSupport: Signature goal
- currentSupport: Current signatures
- allowsOnlineSignature: true
- tags: Include "students", "faculty", or "staff" plus 2-3 more keywords
- organizationName: Petition creator
- organizationUrl: null

ONLY active petitions. Return as JSON array.
```

---

## 9. Maricopa County Board

**URL:** `https://www.maricopa.gov/AgendaCenter`

**Prompt:**
```
Find Maricopa County Board of Supervisors meetings scheduled AFTER March 22, 2026 (next 60 days).

For each agenda item:
- title: SHORT concise title (max 80 chars)
- summary: 2-3 sentences (150-200 words)
- fullDescription: 300-500 words
- sourceUrl: Direct URL
- deadline: Meeting date ISO format - MUST be after March 22, 2026
- category: ONE of: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- type: PUBLIC_HEARING, COUNCIL_VOTE, or CITY_POLICY
- jurisdiction: "Maricopa County, AZ"
- jurisdictionLevel: "COUNTY"
- officialActionUrl: "https://www.maricopa.gov/324/Board-of-Supervisors-Meeting-Information"
- allowsOnlineSignature: true
- tags: Array of 3-5 keywords
- organizationName: "Maricopa County Board of Supervisors"
- organizationUrl: "https://www.maricopa.gov"

ONLY future meetings. Return as JSON array.
```

---

## Usage Instructions

1. Go to TinyFish dashboard (https://app.tinyfish.ai)
2. Create a new agent run
3. Copy the URL from the prompt you want
4. Paste URL into TinyFish
5. Copy the ENTIRE prompt text
6. Paste into TinyFish goal field
7. Run the agent
8. Wait for completion (3-10 minutes)
9. Download or copy the JSON results
10. Run `npm run prisma:import-tinyfish` to import

## Quality Checklist

Before importing, verify your TinyFish results have:
- ✅ SHORT titles (max 80 characters)
- ✅ Proper category from the 12 options (for color badges)
- ✅ Future deadlines only (after March 22, 2026)
- ✅ Summary is 150-200 words
- ✅ fullDescription is 300-500 words
- ✅ Real working URLs
- ✅ NO expired/closed/passed items

## Expected Output Per Source

- **City Council Agendas**: 5-15 agenda items per source
- **Petitions**: 10-20 active petitions per city
- **Total**: 50-100 civic items across all sources

## Tips for Best Results

- Run one source at a time to monitor quality
- Check the streaming URL to watch the agent work
- If results are poor, try again with stealth mode
- Combine results from multiple runs before importing
- Verify dates are in the future before importing

## Category Classification Guide

When TinyFish extracts data, it should classify items like this:

- **Affordable housing, rent control, tenant rights** → HOUSING
- **School funding, curriculum, college costs** → EDUCATION
- **Buses, light rail, bike lanes, roads** → TRANSIT
- **Police, fire, emergency services** → PUBLIC_SAFETY
- **Mental health, community health, hospitals** → HEALTHCARE
- **Jobs, wages, worker rights** → JOBS
- **Climate, parks, sustainability** → ENVIRONMENT
- **Equality, discrimination, voting** → CIVIL_RIGHTS
- **Utilities, waste, parks** → CITY_SERVICES
- **Taxes, budgets, spending** → BUDGET
- **Land use, construction, development** → ZONING
- **Everything else** → OTHER
