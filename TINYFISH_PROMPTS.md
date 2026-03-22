# TinyFish Agent Prompts for RallyPoint

These prompts are designed to extract complete, accurate civic data with NO placeholder information. Each prompt targets specific government sources and extracts all required fields for the RallyPoint platform.

## Required Fields for Each Civic Item

Based on our platform requirements, each civic item MUST have:

### Essential Fields (Required)
- **title**: Full official title (no truncation)
- **summary**: 2-3 sentence description of what this is about
- **fullDescription**: Complete detailed description (200-500 words)
- **sourceUrl**: Direct link to the official page (MUST be real, working URL)
- **category**: One of: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
- **type**: One of: PETITION, BALLOT_INITIATIVE, ORDINANCE, PUBLIC_HEARING, COUNCIL_VOTE, SCHOOL_BOARD, STATE_BILL, CITY_POLICY, OTHER
- **jurisdiction**: City/County name (e.g., "Tempe, AZ", "Phoenix, AZ")
- **jurisdictionLevel**: One of: CITY, COUNTY, STATE, CAMPUS, DISTRICT

### Important Fields (Highly Recommended)
- **deadline**: ISO date string for deadline/meeting date (e.g., "2026-04-15T18:00:00Z")
- **officialActionUrl**: Direct link to take action (sign petition, submit comment, RSVP)
- **targetSupport**: Number of signatures/supporters needed (if applicable)
- **currentSupport**: Current number of signatures/supporters (if available)
- **allowsOnlineSignature**: true/false - can people sign/support online?
- **tags**: Array of relevant tags (e.g., ["affordable housing", "zoning", "development"])

### AI Summary Fields (Optional but Valuable)
- **aiSummary.plainSummary**: Plain language summary (100-150 words)
- **aiSummary.whoAffected**: Who is impacted by this (e.g., "Tempe residents, ASU students")
- **aiSummary.whyItMatters**: Why this matters to the community
- **aiSummary.whatChanges**: What would change if this passes
- **aiSummary.argumentsFor**: Array of arguments supporting this
- **aiSummary.argumentsAgainst**: Array of arguments opposing this
- **aiSummary.nextActions**: Array of actions people can take

### Organization Fields
- **organizationName**: Name of organizing body (e.g., "Tempe City Council")
- **organizationUrl**: Link to organization's website

---

## Prompt Templates by Source Type

### 1. City Council Meetings (Tempe, Phoenix, Mesa, Scottsdale)

```
Go to [CITY_COUNCIL_AGENDA_URL] and extract all agenda items from upcoming meetings.

For each agenda item, extract:

REQUIRED FIELDS:
- title: Full agenda item title exactly as written
- summary: 2-3 sentence summary of what this agenda item is about
- fullDescription: Complete description including background, proposal details, and implications (200-500 words). If the agenda has a staff report or attachment, read it and summarize the key points.
- sourceUrl: Direct URL to this specific agenda item or meeting page
- deadline: Meeting date and time in ISO format (e.g., "2026-04-15T18:00:00Z")
- category: Classify as HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, or OTHER
- type: Classify as PUBLIC_HEARING, COUNCIL_VOTE, ORDINANCE, or CITY_POLICY
- jurisdiction: "[City Name], AZ" (e.g., "Tempe, AZ")
- jurisdictionLevel: "CITY"

IMPORTANT FIELDS:
- officialActionUrl: URL where residents can submit public comments or RSVP
- allowsOnlineSignature: true if online comment submission is available, false otherwise
- tags: Array of 3-5 relevant tags (e.g., ["zoning", "affordable housing", "development"])
- organizationName: "[City Name] City Council"
- organizationUrl: Main city council website URL

WHO IS AFFECTED:
- Identify which neighborhoods, districts, or groups are impacted
- Include specific addresses or areas if mentioned

WHAT CHANGES:
- Explain what would change if this passes
- Include budget impacts, policy changes, or physical changes

WHY IT MATTERS:
- Explain the community impact
- Include any controversy or public interest

NEXT ACTIONS:
- How can residents participate? (attend meeting, submit comments, etc.)
- Include deadlines and contact information

Return as JSON array with all fields populated. NO placeholder text. If a field cannot be determined, use null.
```

**Real URLs to use:**
- Tempe: https://www.tempe.gov/government/city-council/council-meetings
- Phoenix: https://www.phoenix.gov/cityclerk/publicmeetings/city-council-meetings
- Mesa: https://www.mesaaz.gov/government/city-council/agendas-minutes
- Scottsdale: https://www.scottsdaleaz.gov/council/council-meetings

---

### 2. State Legislature Bills (Arizona)

```
Go to https://apps.azleg.gov/BillStatus/BillOverview and find all active bills in the current legislative session.

For each bill, extract:

REQUIRED FIELDS:
- title: Full bill title including bill number (e.g., "HB 2123: Education Funding Reform")
- summary: Official bill summary (2-3 sentences)
- fullDescription: Complete bill description including purpose, provisions, fiscal impact, and current status (200-500 words). Read the bill text or fact sheet if available.
- sourceUrl: Direct URL to the bill page on azleg.gov
- deadline: Next hearing date or vote date in ISO format
- category: Classify based on bill subject
- type: "STATE_BILL"
- jurisdiction: "Arizona"
- jurisdictionLevel: "STATE"

IMPORTANT FIELDS:
- officialActionUrl: URL to contact legislators or submit testimony
- tags: Array including bill number, subject areas, and affected groups
- organizationName: "Arizona State Legislature"
- organizationUrl: "https://www.azleg.gov"
- currentSupport: Number of co-sponsors or yes votes (if available)

BILL DETAILS:
- Current status (committee, floor, governor)
- Sponsor and co-sponsors
- Committee assignments
- Fiscal impact if available

WHO IS AFFECTED:
- Which Arizona residents or groups are impacted
- Geographic areas affected

ARGUMENTS FOR/AGAINST:
- Extract testimony or statements from supporters
- Extract testimony or statements from opponents
- Include any fiscal notes or impact statements

Return as JSON array. NO placeholder text.
```

---

### 3. Public Petitions (Change.org, local petition sites)

```
Go to [PETITION_URL] and extract complete petition information.

REQUIRED FIELDS:
- title: Full petition title exactly as written
- summary: Petition's short description (first 2-3 sentences)
- fullDescription: Complete petition text including background, demands, and why it matters (200-500 words)
- sourceUrl: Direct URL to the petition page
- deadline: Petition deadline if specified, otherwise null
- category: Classify based on petition subject
- type: "PETITION"
- jurisdiction: Target jurisdiction (city, county, state)
- jurisdictionLevel: Appropriate level

IMPORTANT FIELDS:
- officialActionUrl: Direct URL to sign the petition (same as sourceUrl)
- targetSupport: Signature goal
- currentSupport: Current number of signatures
- allowsOnlineSignature: true
- tags: Array of relevant tags from petition
- organizationName: Petition creator or organization
- organizationUrl: Organization website if available

PETITION DETAILS:
- Who started this petition
- Who is the petition addressed to (decision maker)
- What specific action is requested
- Any updates or milestones

WHO IS AFFECTED:
- Extract from petition text who is impacted

WHY IT MATTERS:
- Extract the "why this is important" section

NEXT ACTIONS:
- Sign the petition
- Share with others
- Contact decision makers (include contact info if provided)

Return as JSON. NO placeholder text. All URLs must be real and working.
```

**Real URLs to use:**
- Change.org Tempe: https://www.change.org/search?q=tempe%20arizona
- Change.org Phoenix: https://www.change.org/search?q=phoenix%20arizona
- Change.org ASU: https://www.change.org/search?q=asu%20arizona%20state

---

### 4. County Government (Maricopa County)

```
Go to https://www.maricopa.gov/AgendaCenter and extract all upcoming Board of Supervisors agenda items.

REQUIRED FIELDS:
- title: Full agenda item title
- summary: 2-3 sentence summary
- fullDescription: Complete description from staff report or agenda packet (200-500 words)
- sourceUrl: Direct URL to agenda item or meeting page
- deadline: Meeting date/time in ISO format
- category: Classify appropriately
- type: PUBLIC_HEARING, COUNCIL_VOTE, or CITY_POLICY
- jurisdiction: "Maricopa County, AZ"
- jurisdictionLevel: "COUNTY"

IMPORTANT FIELDS:
- officialActionUrl: URL for public comment submission
- allowsOnlineSignature: true if online comments accepted
- tags: Relevant tags including affected areas
- organizationName: "Maricopa County Board of Supervisors"
- organizationUrl: "https://www.maricopa.gov"

COUNTY-SPECIFIC:
- Which supervisorial districts are affected
- Budget implications
- Related county departments

Return as JSON array. NO placeholder text.
```

---

### 5. School Districts (Tempe Elementary, Tempe Union High School)

```
Go to [SCHOOL_BOARD_URL] and extract all upcoming school board meeting agenda items.

REQUIRED FIELDS:
- title: Full agenda item title
- summary: 2-3 sentence summary of the item
- fullDescription: Complete description including educational impact, budget, and community implications (200-500 words)
- sourceUrl: Direct URL to agenda or meeting page
- deadline: Board meeting date/time in ISO format
- category: "EDUCATION"
- type: "SCHOOL_BOARD"
- jurisdiction: "[District Name], Tempe, AZ"
- jurisdictionLevel: "DISTRICT"

IMPORTANT FIELDS:
- officialActionUrl: URL for public comment or RSVP
- allowsOnlineSignature: true if online participation available
- tags: Include grade levels, schools, or programs affected
- organizationName: "[District Name] School Board"
- organizationUrl: District website URL

EDUCATION-SPECIFIC:
- Which schools or grade levels are affected
- Budget impact
- Student/parent impact
- Teacher/staff impact

Return as JSON array. NO placeholder text.
```

**Real URLs:**
- Tempe Elementary: https://www.tempeschools.org/domain/51
- Tempe Union High School: https://www.tempeunion.org/domain/51

---

### 6. ASU Campus Issues

```
Go to [ASU_URL] and extract campus-related civic issues, policies, or initiatives.

REQUIRED FIELDS:
- title: Full title of the issue/policy
- summary: 2-3 sentence summary
- fullDescription: Complete description including impact on students, faculty, and campus community (200-500 words)
- sourceUrl: Direct URL to the announcement or policy page
- deadline: Relevant deadline (comment period, vote date, etc.)
- category: Classify appropriately (often EDUCATION, CIVIL_RIGHTS, or CAMPUS)
- type: "CITY_POLICY" or "OTHER"
- jurisdiction: "Arizona State University, Tempe"
- jurisdictionLevel: "CAMPUS"

IMPORTANT FIELDS:
- officialActionUrl: URL to provide feedback or take action
- tags: Include affected groups (students, faculty, staff)
- organizationName: "Arizona State University"
- organizationUrl: "https://www.asu.edu"

CAMPUS-SPECIFIC:
- Which students/groups are affected
- Academic or administrative impact
- How to participate or provide input

Return as JSON array. NO placeholder text.
```

**Real URLs:**
- ASU News: https://news.asu.edu/
- ASU Student Government: https://eoss.asu.edu/usgt
- ASU Policies: https://www.asu.edu/aad/manuals/

---

## Output Format

All prompts should return JSON in this exact format:

```json
[
  {
    "title": "Full official title here",
    "summary": "2-3 sentence summary here",
    "fullDescription": "Complete 200-500 word description here",
    "sourceUrl": "https://real-working-url.com/page",
    "category": "HOUSING",
    "type": "PUBLIC_HEARING",
    "jurisdiction": "Tempe, AZ",
    "jurisdictionLevel": "CITY",
    "deadline": "2026-04-15T18:00:00Z",
    "officialActionUrl": "https://real-action-url.com",
    "targetSupport": 1000,
    "currentSupport": 450,
    "allowsOnlineSignature": true,
    "tags": ["affordable housing", "zoning", "development"],
    "organizationName": "Tempe City Council",
    "organizationUrl": "https://www.tempe.gov",
    "aiSummary": {
      "plainSummary": "Plain language summary here",
      "whoAffected": "Tempe residents in downtown area, renters",
      "whyItMatters": "Would increase affordable housing by 20%",
      "whatChanges": "Zoning changes to allow mixed-use development",
      "argumentsFor": [
        "Increases affordable housing supply",
        "Promotes walkable neighborhoods"
      ],
      "argumentsAgainst": [
        "May increase traffic congestion",
        "Changes neighborhood character"
      ],
      "nextActions": [
        "Attend public hearing on April 15",
        "Submit written comments by April 10",
        "Contact city council members"
      ]
    }
  }
]
```

## Critical Rules

1. **NO PLACEHOLDER TEXT**: Every field must contain real data or be null
2. **REAL URLS ONLY**: All URLs must be actual working links to government/official sources
3. **COMPLETE DESCRIPTIONS**: fullDescription must be 200-500 words with real details
4. **ACCURATE DATES**: All dates must be real upcoming dates in ISO format
5. **PROPER CLASSIFICATION**: Use exact enum values for category, type, jurisdictionLevel
6. **EXTRACT, DON'T INVENT**: Only include information that exists on the source page
7. **VERIFY LINKS**: Test that sourceUrl and officialActionUrl actually work

## Quality Checklist

Before returning data, verify:
- [ ] Title is complete and official (not truncated)
- [ ] Summary is 2-3 sentences and informative
- [ ] fullDescription is 200-500 words with real details
- [ ] sourceUrl is a real, working link
- [ ] Category and type use correct enum values
- [ ] Deadline is a real date in ISO format (or null)
- [ ] officialActionUrl is a real action link (or null)
- [ ] Tags are relevant and specific
- [ ] Organization name and URL are real
- [ ] NO "Lorem ipsum", "TBD", "Coming soon", or placeholder text anywhere
