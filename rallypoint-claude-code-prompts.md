# RallyPoint — Claude Code Build Prompts

> **How to use this file**: Work through these prompts in order. Each prompt is a self-contained instruction you paste into Claude Code. They're designed to build on each other — the output of Phase 1 is assumed present when you run Phase 2, etc.
>
> **Convention**: Each prompt starts with `PROMPT:` and ends with `---`. Copy everything between those markers.

---

## Phase 0 — Project Scaffolding & Configuration

### Prompt 0.1 — Initialize the Next.js Project

```
PROMPT:

Initialize a new Next.js 14+ project with TypeScript and the App Router in the current directory called "rallypoint". Use pnpm as the package manager.

Configure:
- Tailwind CSS v4
- shadcn/ui (use the "new-york" style, slate base color, CSS variables enabled)
- ESLint + Prettier
- Path alias "@/" pointing to "src/"

Create the following folder structure inside src/:

src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (auth)/             # Auth-gated route group
│   ├── (public)/           # Public routes (landing, about)
│   ├── admin/              # Admin/organizer dashboard
│   └── api/                # API route handlers
├── components/
│   ├── ui/                 # shadcn primitives (button, card, etc.)
│   ├── layout/             # Shell, nav, footer, sidebar
│   ├── civic/              # Issue cards, action ladder, impact widgets
│   ├── community/          # Discussion threads, social feed
│   ├── maps/               # Map components, district overlays
│   └── onboarding/         # Onboarding flow steps
├── lib/
│   ├── db/                 # Prisma client, seed helpers
│   ├── ai/                 # Claude API integration, prompt templates
│   ├── geo/                # Geocoding, PostGIS queries, district lookup
│   ├── auth/               # Auth helpers (Clerk or Supabase)
│   ├── moderation/         # Toxicity filtering, moderation pipeline
│   ├── cache/              # Redis client & helpers
│   └── utils/              # General utilities
├── hooks/                  # Custom React hooks
├── types/                  # Shared TypeScript types & interfaces
├── constants/              # App-wide constants (categories, jurisdictions)
└── styles/                 # Global styles, Tailwind extensions

Create a root .env.example with placeholder keys for:
DATABASE_URL, DIRECT_URL, REDIS_URL, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, ANTHROPIC_API_KEY, GEOCODING_API_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_MAPBOX_TOKEN

Add a thorough .gitignore covering Next.js, node_modules, .env, .prisma, and editor files.

Don't build any UI yet — just the skeleton and config files. Confirm everything compiles with `pnpm dev`.
```

---

### Prompt 0.2 — Install Core Dependencies

```
PROMPT:

In the rallypoint project, install the following dependencies:

Production:
- prisma and @prisma/client
- ioredis (Redis client)
- @anthropic-ai/sdk (Claude API)
- @clerk/nextjs (authentication)
- zod (schema validation)
- date-fns (date formatting)
- lucide-react (icons)
- recharts (charts for impact dashboard)
- @tanstack/react-query (data fetching)
- nanoid (ID generation)
- sanitize-html (XSS prevention)

Dev:
- @types/sanitize-html
- prisma (already a dev dep from init)
- tsx (for running seed scripts)

After installing, create:

1. src/lib/db/prisma.ts — singleton Prisma client with connection pooling best practices for Next.js (global instance in dev to avoid hot-reload connection exhaustion)

2. src/lib/cache/redis.ts — singleton ioredis client that reads REDIS_URL from env, with reconnect strategy and error logging

3. src/lib/ai/claude.ts — Anthropic client initialized from ANTHROPIC_API_KEY, export a helper function `summarizeCivicDocument(text: string, metadata: object)` that is a stub for now returning a placeholder object

4. src/lib/auth/server.ts — export helpers `getCurrentUser()` and `requireAuth()` using Clerk's server-side auth helpers for App Router

Make sure the project still compiles cleanly.
```

---

## Phase 1 — Database Schema

### Prompt 1.1 — Prisma Schema (Core Models)

```
PROMPT:

Create the Prisma schema at prisma/schema.prisma for the RallyPoint platform. Use PostgreSQL as the provider. Enable the "postgis" preview feature and the "uuid-ossp" extension.

Define these models with the following relationships and design principles:
- Use UUID primary keys everywhere
- Add createdAt/updatedAt timestamps on every model
- Use enums where appropriate
- Add indexes on commonly queried fields
- Add comments on models and important fields

MODELS:

1. User
   - id, clerkId (unique), email (unique), displayName, avatarUrl
   - role enum: USER, ORGANIZER, MODERATOR, ADMIN
   - onboardingCompleted (boolean)
   - relations: addresses, interests, engagements, comments, savedItems

2. UserAddress
   - id, userId (FK)
   - rawAddress, normalizedAddress
   - latitude, longitude (Float)
   - geocodeConfidence (Float)
   - city, state, zip, county
   - districtIds (Json — stores array of district IDs: city council, school board, congressional, state leg, etc.)
   - jurisdictionTags (String[])
   - isPrimary (boolean)
   - index on (latitude, longitude) and (zip)

3. UserInterest
   - id, userId (FK)
   - category enum: HOUSING, EDUCATION, TRANSIT, PUBLIC_SAFETY, HEALTHCARE, JOBS, ENVIRONMENT, CIVIL_RIGHTS, CITY_SERVICES, BUDGET, ZONING, OTHER
   - createdAt

4. CivicItem
   - id, title, slug (unique)
   - category (same enum as UserInterest)
   - type enum: PETITION, BALLOT_INITIATIVE, ORDINANCE, PUBLIC_HEARING, COUNCIL_VOTE, SCHOOL_BOARD, STATE_BILL, CITY_POLICY, OTHER
   - status enum: DRAFT, ACTIVE, CLOSED, PASSED, FAILED, WITHDRAWN
   - jurisdiction, jurisdictionLevel enum: CITY, COUNTY, STATE, CAMPUS, DISTRICT
   - districtIds (Json)
   - summary (short text), fullDescription (long text)
   - sourceUrl, sourceDocumentId (optional FK to SourceDocument)
   - aiSummaryId (optional FK to AISummary)
   - deadline (DateTime?), effectiveDate (DateTime?)
   - targetSupport (Int?), currentSupport (Int, default 0)
   - allowsOnlineSignature (Boolean, default false)
   - officialActionUrl (String?) — where to go if online action isn't supported
   - organizerId (FK to User, optional)
   - isVerified (Boolean, default false)
   - latitude, longitude (Float?, for map display)
   - tags (String[])
   - index on slug, status, category, jurisdiction, deadline

5. SourceDocument
   - id, civicItemId (FK)
   - title, originalUrl, fileUrl
   - contentType, rawText (large text)
   - uploadedById (FK to User)
   - processingStatus enum: PENDING, PROCESSING, COMPLETED, FAILED

6. AISummary
   - id, civicItemId (FK, unique)
   - sourceDocumentId (FK, optional)
   - modelVersion (String — track which Claude model)
   - plainSummary, whoAffected, whatChanges, whyItMatters
   - argumentsFor (Json), argumentsAgainst (Json)
   - importantDates (Json), nextActions (Json)
   - generatedAt (DateTime)
   - disclaimer (String, has default text)
   - index on civicItemId

7. EngagementEvent
   - id, userId (FK), civicItemId (FK)
   - action enum: VIEW, SAVE, UNSAVE, SHARE, SUPPORT, UNSUPPORT, COMMENT, RSVP, VOLUNTEER, CONTACT_REP, SIGN, DOWNLOAD_FORM
   - metadata (Json?)
   - ipHash (String? — hashed, not raw IP)
   - createdAt
   - unique constraint on (userId, civicItemId, action) for idempotent actions like SUPPORT
   - index on (userId, createdAt), (civicItemId, action)

8. Comment
   - id, userId (FK), civicItemId (FK)
   - parentId (self-referential FK for threading)
   - threadType enum: QUESTION, SUPPORT, CONCERN, EVIDENCE
   - body (text), sanitizedBody (text)
   - status enum: VISIBLE, HIDDEN, FLAGGED, REMOVED
   - moderationScore (Float?)
   - createdAt, updatedAt
   - index on (civicItemId, threadType, status)

9. ModerationFlag
   - id, commentId (FK), reportedById (FK to User)
   - reason enum: SPAM, HARASSMENT, MISINFORMATION, OFF_TOPIC, OTHER
   - details (String?)
   - status enum: PENDING, REVIEWED, ACTIONED, DISMISSED
   - reviewedById (FK to User, optional)
   - reviewedAt (DateTime?)

10. OrganizerUpdate
    - id, civicItemId (FK), authorId (FK to User)
    - title, body
    - isVerified (Boolean)
    - createdAt

11. AuditLog
    - id, userId (FK, optional), action (String)
    - entityType (String), entityId (String)
    - metadata (Json?)
    - ipHash (String?)
    - createdAt
    - index on (entityType, entityId), (userId, createdAt)

12. FraudSignal
    - id, userId (FK, optional)
    - signalType enum: RAPID_ACTIONS, DUPLICATE_IP, SUSPICIOUS_PATTERN, BOT_DETECTED
    - severity enum: LOW, MEDIUM, HIGH, CRITICAL
    - details (Json)
    - resolved (Boolean, default false)
    - createdAt

After defining the schema, generate the Prisma client. Don't run migrations yet — we'll do that when the DB is connected.
```

---

### Prompt 1.2 — Seed Data for Arizona Deployment

```
PROMPT:

Create a seed script at prisma/seed.ts that populates the database with realistic mock data for a Tempe/Phoenix/Maricopa County Arizona deployment. Use tsx to run it.

Include:

1. 3 test users:
   - A student at ASU (role: USER, interests: HOUSING, TRANSIT, EDUCATION)
   - A local organizer (role: ORGANIZER, interests: ENVIRONMENT, ZONING)
   - An admin/moderator (role: ADMIN)
   Each with a UserAddress in the Tempe/Phoenix area with realistic geocoordinates and districtIds (use placeholder district IDs like "tempe-council-5", "az-ld-26", "maricopa-county", "az-congressional-4").

2. 8-10 CivicItems spanning diverse types and categories:
   - A Tempe city council vote on rent stabilization (ORDINANCE, HOUSING, CITY)
   - An ASU campus transit expansion petition (PETITION, TRANSIT, CAMPUS)
   - A Maricopa County ballot initiative on water conservation (BALLOT_INITIATIVE, ENVIRONMENT, COUNTY)
   - A public hearing on Tempe Town Lake development (PUBLIC_HEARING, ZONING, CITY)
   - A state bill on tuition caps at Arizona public universities (STATE_BILL, EDUCATION, STATE)
   - A school board vote on mental health resources (SCHOOL_BOARD, HEALTHCARE, DISTRICT)
   - A city policy proposal for bike lane expansion (CITY_POLICY, TRANSIT, CITY)
   - A petition for more affordable student housing near campus (PETITION, HOUSING, CAMPUS)
   Give each realistic titles, summaries, deadlines (some upcoming, some past), varying statuses, support counts, and tags. Set 2-3 as allowing online signatures.

3. For 3 of the civic items, create AISummary records with realistic structured summaries (plainSummary, whoAffected, whatChanges, whyItMatters, argumentsFor as JSON array of strings, argumentsAgainst as JSON array of strings, importantDates as JSON array of {date, description}, nextActions as JSON array of strings).

4. 15-20 EngagementEvents spread across users and items (views, saves, supports, comments).

5. 5-6 Comments on 2-3 different civic items, spread across thread types (QUESTION, SUPPORT, CONCERN), some with replies (parentId).

6. 1 OrganizerUpdate on the rent stabilization item.

7. A few AuditLog entries for the support actions.

Add a "main" function wrapped in proper error handling. Add the prisma seed command to package.json scripts. Include a note at the top of the file explaining this is Arizona-specific test data.
```

---

## Phase 2 — Shared Types, Constants & Utilities

### Prompt 2.1 — TypeScript Types & Constants

```
PROMPT:

Create the following shared type and constant files for RallyPoint:

1. src/types/civic.ts
   Export TypeScript types that mirror the Prisma models but are suitable for frontend use (no Prisma internal types). Include:
   - CivicItemCard (the shape rendered in feed cards: id, title, slug, category, type, status, jurisdiction, jurisdictionLevel, summary, deadline, currentSupport, targetSupport, allowsOnlineSignature, tags, districtIds, latitude, longitude)
   - CivicItemDetail (extends Card with fullDescription, aiSummary, sourceUrl, organizerUpdates, officialActionUrl)
   - AISummaryData (all the structured fields)
   - EngagementAction (union type of all action strings)
   - CommentThread (comment with nested replies)
   - UserProfile (id, displayName, avatarUrl, role, interests, primaryAddress with city/state only)
   - ImpactStats (issuesViewed, issuesSaved, actionsCompleted, commentsPosted, supportGiven)

2. src/types/api.ts
   Export types for API request/response shapes:
   - ApiResponse<T> (success: boolean, data?: T, error?: string)
   - PaginatedResponse<T> (extends ApiResponse with page, pageSize, totalCount, totalPages)
   - FeedFilters (category?, type?, jurisdiction?, status?, search?, sort?, page?, pageSize?)

3. src/constants/categories.ts
   Export:
   - CIVIC_CATEGORIES: array of { value, label, icon (lucide icon name), color (tailwind color) } for each category enum value
   - CIVIC_TYPES: array of { value, label, description }
   - JURISDICTION_LEVELS: array of { value, label }
   - ENGAGEMENT_ACTIONS: ordered array representing the "action ladder" from lowest to highest engagement: [VIEW, SAVE, SHARE, COMMENT, SUPPORT, CONTACT_REP, RSVP, VOLUNTEER, SIGN, DOWNLOAD_FORM]
   - ACTION_LABELS: record mapping each action to { label, description, icon }

4. src/constants/arizona.ts
   Export Arizona-specific constants:
   - AZ_DISTRICTS: sample district definitions with id, name, level, boundaries description
   - AZ_JURISDICTIONS: jurisdictions relevant to Tempe/Phoenix/Maricopa
   - DEFAULT_CENTER: { lat, lng } for Tempe, AZ

5. src/lib/utils/format.ts
   Export utility functions:
   - formatDeadline(date): returns "3 days left", "Ended 2 weeks ago", etc.
   - formatSupport(current, target): returns "234 / 500 (47%)"
   - formatJurisdiction(jurisdiction, level): returns "Tempe, City"
   - truncate(text, maxLength): smart truncation at word boundaries
   - slugify(text): URL-safe slug generation
```

---

## Phase 3 — Authentication & Geo-Validation

### Prompt 3.1 — Clerk Auth Integration

```
PROMPT:

Set up Clerk authentication for RallyPoint using @clerk/nextjs with the App Router.

1. Create src/middleware.ts with Clerk middleware that:
   - Protects all routes under /(auth)/ group
   - Allows public access to /(public)/ routes and /api/public/ routes
   - Allows webhook routes through

2. Create src/app/(auth)/layout.tsx that wraps children in auth check

3. Create src/lib/auth/server.ts:
   - getCurrentUser(): gets Clerk user, looks up or creates the matching User record in our DB (upsert by clerkId), returns our User model
   - requireAuth(): same as above but throws/redirects if not authenticated
   - requireRole(roles: Role[]): checks user role, throws if not authorized

4. Create src/lib/auth/sync.ts:
   - syncClerkUser(clerkUser): creates or updates our DB user from Clerk data
   - Called on first login and periodically

5. Create src/app/api/webhooks/clerk/route.ts:
   - Clerk webhook handler for user.created and user.updated events
   - Verifies webhook signature
   - Calls syncClerkUser

6. Create a simple src/app/(auth)/onboarding/page.tsx placeholder that we'll build out later — for now just show "Welcome to RallyPoint" with the user's name from Clerk.

Make sure the auth flow is: Clerk handles sign-up/sign-in UI → webhook syncs to our DB → middleware gates protected routes → server helpers fetch our enriched user record.
```

---

### Prompt 3.2 — Geo-Validation Workflow

```
PROMPT:

Build the geovalidation system for RallyPoint.

1. Create src/lib/geo/geocode.ts:
   - geocodeAddress(address: string): calls a geocoding API (use Google Maps Geocoding or Nominatim/OpenStreetMap as fallback). Returns { latitude, longitude, normalizedAddress, city, state, zip, county, confidence }.
   - reverseGeocode(lat, lng): returns address components from coordinates
   - Add Redis caching for geocode results (cache for 30 days)

2. Create src/lib/geo/districts.ts:
   - lookupDistricts(lat: number, lng: number): Given coordinates, determine which districts the point falls in. For MVP, use a mapping table approach:
     * Map ZIP codes to known district IDs for Tempe/Phoenix area
     * Return array of { districtId, districtName, level } objects
   - isUserInJurisdiction(userAddress: UserAddress, civicItem: CivicItem): boolean — checks if user's districtIds overlap with the civic item's districtIds or jurisdiction
   - Add a comment explaining how this would upgrade to real PostGIS spatial queries with district boundary polygons

3. Create src/lib/geo/validation.ts:
   - validateAndStoreAddress(userId: string, rawAddress: string): orchestrates geocoding, district lookup, and stores as UserAddress
   - Returns the created UserAddress record
   - If geocode confidence is below 0.7, flag for manual review

4. Create src/app/api/user/address/route.ts:
   - POST: accepts { address: string }, calls validateAndStoreAddress, returns the result
   - GET: returns current user's primary address
   - Requires auth

5. Create a Zod schema for address validation input at src/lib/validators/address.ts.

Design this so PostGIS polygon queries can replace the ZIP-code mapping later without changing the interface.
```

---

## Phase 4 — Claude AI Integration

### Prompt 4.1 — Summarization Pipeline

```
PROMPT:

Build the Claude AI summarization pipeline for RallyPoint civic documents.

1. Create src/lib/ai/prompts.ts with prompt templates:

   CIVIC_SUMMARIZATION_PROMPT — a system prompt for Claude that instructs it to analyze civic/legal/policy documents and return a JSON object with this exact structure:
   {
     plainSummary: string (2-3 paragraphs, 8th grade reading level, no jargon),
     whoAffected: string (specific groups and demographics),
     whatChanges: string (concrete changes if this passes/takes effect),
     whyItMatters: string (local relevance, real-life impact),
     argumentsFor: string[] (3-5 neutral, substantive arguments),
     argumentsAgainst: string[] (3-5 neutral, substantive arguments),
     importantDates: { date: string, description: string }[] (deadlines, hearings, votes),
     nextActions: string[] (specific things a concerned citizen can do),
     categories: string[] (from our category enum),
     affectedJurisdictions: string[] (city, county, state names)
   }

   The system prompt should emphasize:
   - Neutral tone, no advocacy
   - Plain language aimed at first-time civic participants
   - Local context and real-life examples
   - Accuracy — don't infer what isn't in the document
   - If information for a field isn't available, say so honestly

   TOXICITY_CHECK_PROMPT — a system prompt for checking comment toxicity, returns { score: 0-1, flags: string[], suggestion: string }

2. Create src/lib/ai/claude.ts (replace the stub):
   - initClaude(): returns Anthropic client
   - summarizeCivicDocument(text: string, metadata: { title, type, jurisdiction }): calls Claude with the summarization prompt, parses the JSON response, validates with Zod, returns typed AISummaryData
   - checkToxicity(text: string): calls Claude with toxicity prompt, returns score and flags
   - Add retry logic (3 attempts with exponential backoff)
   - Add error handling that returns a structured error, never throws to the caller uncaught
   - Log token usage for cost tracking

3. Create src/lib/ai/jobs.ts:
   - processSummarizationJob(sourceDocumentId: string): loads document from DB, calls summarizeCivicDocument, stores AISummary in DB, updates SourceDocument status
   - For MVP, this runs synchronously when called. Add a TODO comment for moving to a job queue (BullMQ or similar)
   - Add the standard disclaimer text as a constant: "This summary was generated by AI to help make civic documents more accessible. It is not legal advice. Always refer to the official document for authoritative information."

4. Create src/app/api/admin/summarize/route.ts:
   - POST: accepts { sourceDocumentId }, requires ORGANIZER or ADMIN role, triggers summarization job
   - Returns job status

5. Create Zod schemas at src/lib/validators/ai.ts for validating Claude's response structure.
```

---

## Phase 5 — Core API Routes

### Prompt 5.1 — Civic Items API

```
PROMPT:

Build the civic items API for RallyPoint.

1. src/app/api/civic-items/route.ts (GET):
   - Accepts query params: category, type, status, jurisdiction, jurisdictionLevel, search (text), sort (deadline, newest, trending, support), page, pageSize
   - If user is authenticated, also filter/boost by user's districtIds and interests
   - "trending" sort = most engagement events in last 7 days
   - Returns PaginatedResponse<CivicItemCard>
   - Add Redis caching for the feed (cache key includes filter params, TTL 5 minutes)

2. src/app/api/civic-items/[slug]/route.ts (GET):
   - Returns full CivicItemDetail including AI summary, organizer updates
   - Records a VIEW engagement event for the authenticated user (idempotent per session)
   - No caching on detail pages (we want fresh engagement counts)

3. src/app/api/civic-items/[slug]/engage/route.ts (POST):
   - Accepts { action: EngagementAction, metadata?: object }
   - Validates the action is a valid enum value
   - For SUPPORT action: increments CivicItem.currentSupport (use Prisma atomic increment)
   - For UNSUPPORT: decrements and removes engagement record
   - Enforces idempotency: can't SUPPORT twice
   - Creates AuditLog entry for high-value actions (SUPPORT, SIGN, VOLUNTEER)
   - Rate limiting: max 30 engagement actions per user per minute (use Redis)
   - Returns updated engagement state for the user on this item

4. src/app/api/civic-items/[slug]/comments/route.ts:
   - GET: returns comments for item, grouped by threadType, with nested replies, paginated
   - POST: creates a new comment, requires auth
     * Validates body length (10-2000 chars)
     * Runs sanitize-html on body
     * Calls checkToxicity — if score > 0.7, auto-flag for moderation instead of posting
     * Stores both raw body and sanitizedBody
     * Creates AuditLog entry

5. Create reusable middleware helpers at src/lib/api/middleware.ts:
   - withAuth(handler): wraps route handler with auth check
   - withRateLimit(key, maxRequests, windowSeconds): Redis-based rate limiter
   - withValidation(schema): Zod validation for request body
   - These should work with Next.js App Router route handlers
```

---

### Prompt 5.2 — User & Impact API

```
PROMPT:

Build the user profile and impact tracking APIs.

1. src/app/api/user/profile/route.ts:
   - GET: returns current user's profile, interests, primary address (city/state only, not full address), and engagement stats
   - PATCH: updates displayName, interests. Validates with Zod.

2. src/app/api/user/impact/route.ts (GET):
   - Returns the user's personal impact dashboard data:
     * Total issues viewed, saved, supported, commented on
     * Actions by type (count per engagement action)
     * Recent activity timeline (last 20 engagement events with civic item titles)
     * "Streak" — consecutive days with at least one engagement
     * Categories engaged with (distribution)

3. src/app/api/community/impact/route.ts (GET):
   - Returns community-level impact data:
     * Total engagements this week across all users
     * Trending issues (top 5 by engagement velocity)
     * Engagement by category (pie chart data)
     * Milestone achievements: compute and return milestone strings like "247 students engaged this week", "Rent Stabilization reached 80% of target support"
     * Active districts (which districts have most engagement)
   - Cache this in Redis for 15 minutes

4. src/app/api/user/saved/route.ts:
   - GET: returns user's saved civic items (items with SAVE engagement event)
   - Paginated, sorted by save date

5. src/app/api/user/onboarding/route.ts:
   - POST: accepts { interests: string[], address: string, displayName: string }
   - Validates and stores interests, geocodes and stores address, updates displayName
   - Sets onboardingCompleted = true
   - Returns complete user profile
```

---

## Phase 6 — UI Components

### Prompt 6.1 — Layout Shell & Navigation

```
PROMPT:

Build the app layout shell and navigation for RallyPoint. The design should feel modern, empowering, and community-driven — not like a government portal. Think civic energy meets clean product design.

Design direction:
- Color palette: deep navy (#0f172a) as anchor, vibrant coral/orange (#f97316) as primary action color, soft sky blue (#38bdf8) as secondary, warm neutrals for backgrounds
- Typography: use "Plus Jakarta Sans" from Google Fonts for headings (bold, confident) and "DM Sans" for body text (clean, readable)
- Feel: energetic but trustworthy. Rounded corners, subtle shadows, micro-interactions on hover

1. src/components/layout/AppShell.tsx:
   - Main layout wrapper with responsive sidebar (desktop) / bottom nav (mobile)
   - Top bar with: RallyPoint logo (text logo with a small map pin icon), search input, notification bell, user avatar menu
   - Sidebar nav items with icons: Home (feed), Discover, My Impact, Saved, Community, Profile
   - Admin nav items shown only for ORGANIZER/ADMIN roles: Dashboard, Moderation
   - Mobile: collapsible bottom tab bar with 5 main items
   - Active state indicator on current route

2. src/components/layout/TopBar.tsx:
   - Sticky top bar
   - Search input that navigates to discover page with query param
   - User avatar dropdown with: Profile, Settings, Sign Out
   - Location indicator showing user's city (e.g., "Tempe, AZ")

3. src/components/layout/MobileNav.tsx:
   - Fixed bottom nav bar, only shows on mobile
   - 5 tabs: Home, Discover, Impact, Saved, Profile
   - Active tab highlighted with primary color

4. src/components/layout/Footer.tsx:
   - Simple footer for public pages: About, Privacy, Terms, Contact, "Built for civic engagement"

5. src/app/(auth)/layout.tsx:
   - Uses AppShell, wraps children
   - Fetches current user and passes via context or prop

6. src/app/(public)/layout.tsx:
   - Simpler layout without sidebar, just TopBar and Footer

Use shadcn/ui Sheet for mobile sidebar, DropdownMenu for user menu. All components must be fully responsive.
```

---

### Prompt 6.2 — Civic Item Cards

```
PROMPT:

Build the civic item card components — the primary content unit users see in feeds and discover pages.

1. src/components/civic/CivicItemCard.tsx:
   A visually engaging card that displays a civic item in the feed. Should NOT look like a boring list item.

   Layout:
   - Top: colored category badge (use category colors from constants) + jurisdiction label + type badge
   - Title: bold, 2 lines max with truncation
   - Summary: 2-3 lines of plain text summary, truncated
   - Bottom section:
     * Deadline indicator (red if < 3 days, yellow if < 7, green otherwise; "Ended" if past)
     * Support progress bar (if targetSupport exists): animated fill bar showing currentSupport/targetSupport with percentage
     * Quick action buttons: Save (bookmark icon, toggles), Share (share icon), Support (heart/thumbs-up, shows count)
   - Hover: subtle lift shadow, slight scale

   Props: CivicItemCard type, onEngage callback, userEngagement (which actions user has taken)

2. src/components/civic/CivicItemCardSkeleton.tsx:
   Loading skeleton matching the card layout, using shadcn Skeleton component.

3. src/components/civic/CategoryBadge.tsx:
   Colored badge component. Takes category enum value, renders icon + label with the category's color.

4. src/components/civic/SupportBar.tsx:
   Animated progress bar showing support count vs target.
   - Shows "234 of 500 supporters" text
   - Bar fills with gradient animation
   - Milestone markers at 25%, 50%, 75%, 100%
   - Celebratory state when target is reached (green + checkmark)

5. src/components/civic/DeadlineChip.tsx:
   Shows deadline as relative time with color coding.
   - Uses formatDeadline utility
   - Red/urgent styling for items expiring soon
   - "Closed" chip for ended items

6. src/components/civic/QuickActions.tsx:
   Row of action buttons (Save, Share, Support) with:
   - Toggle states (filled/unfilled icons)
   - Optimistic updates (update UI immediately, revert on error)
   - Count display for support
   - Share opens native share API or copies link

Make the cards feel alive and interactive. Add subtle hover animations and smooth transitions.
```

---

### Prompt 6.3 — Issue Detail & Action Ladder

```
PROMPT:

Build the issue detail page and action ladder component.

1. src/app/(auth)/issues/[slug]/page.tsx:
   Server component that fetches civic item detail by slug and renders the full detail view.

2. src/components/civic/IssueDetail.tsx:
   Full issue detail layout:
   - Hero section: large title, category badge, jurisdiction, status badge, type
   - Key info row: deadline, support count, verified badge if applicable
   - Tabs or sections:
     * "Summary" — AI-generated summary with expand/collapse sections for each field (who's affected, what changes, why it matters, arguments for/against, dates, next actions). Show the AI disclaimer at the top of this section.
     * "Full Details" — original description and link to source document
     * "Discussion" — community comments (embed CommunityDiscussion component)
     * "Updates" — organizer updates timeline
   - Sticky bottom bar on mobile with primary action button

3. src/components/civic/ActionLadder.tsx:
   A progressive engagement component shown on the detail page sidebar (desktop) or as a bottom sheet (mobile).

   Display actions as a visual ladder/steps:
   - Learn More (always available, links to summary)
   - Save for Later (toggle)
   - Share (opens share)
   - Join Discussion (scrolls to comments)
   - Show Support (support action)
   - Contact Representative (opens email/phone template)
   - RSVP to Meeting (if hearing/meeting date exists)
   - Volunteer (if organizer has enabled)
   - Sign (if allowsOnlineSignature === true)
   - Official Action (if !allowsOnlineSignature, shows button linking to officialActionUrl with explanation)

   Each step shows:
   - Icon
   - Label
   - Whether user has completed it (checkmark)
   - Whether it's available or locked (some actions only available after prerequisites)

   Make completed actions feel rewarding — checkmark animation, color change.

4. src/components/civic/AISummarySection.tsx:
   Renders the AI summary in an accessible, scannable layout:
   - Each field (who's affected, what changes, etc.) as an expandable accordion section
   - Arguments for/against shown side-by-side on desktop, stacked on mobile
   - Important dates as a mini timeline
   - Next actions as a checklist-style list
   - Disclaimer banner at top: styled distinctly (info blue background, ℹ️ icon)

5. src/components/civic/OfficialActionBanner.tsx:
   When a civic item does NOT allow online signatures, show a prominent banner:
   "Online signing is not available for this item. Here's how to take official action:"
   With buttons/links to: official website, download form, find a local event, contact info.
```

---

### Prompt 6.4 — Community Discussion

```
PROMPT:

Build the community discussion components for civic item pages.

1. src/components/community/CommunityDiscussion.tsx:
   Main discussion container for a civic item.
   - Tab bar for thread types: All, Questions, Support, Concerns, Evidence/Resources
   - Sort options: Newest, Most Helpful
   - "Add Comment" button that opens the composer
   - Renders list of CommentThread components
   - Pagination (load more button)

2. src/components/community/CommentThread.tsx:
   Single comment with nested replies:
   - User avatar, display name, role badge (if ORGANIZER/MODERATOR), timestamp
   - Thread type badge (Question, Support, Concern, Evidence)
   - Comment body (rendered from sanitized HTML, but mostly plain text)
   - Actions: Reply, Helpful (like), Flag
   - Nested replies indented, max 2 levels deep
   - Collapsed state if many replies ("Show 4 more replies")
   - Flagged/hidden comments show "[This comment is under review]"

3. src/components/community/CommentComposer.tsx:
   Form for writing a comment:
   - Thread type selector (required): Question, Support, Concern, Evidence
   - Text area with character counter (10-2000 chars)
   - Civility reminder shown above the textarea: "Keep it constructive. Focus on the issue, not the person."
   - Submit button with loading state
   - If replying, show the parent comment being replied to
   - Client-side validation before submission

4. src/components/community/ModerationBanner.tsx:
   If a comment was auto-flagged or is under review, show appropriate status message.

5. src/components/community/CommunityPulse.tsx:
   Widget showing community activity on an issue:
   - "X people discussing this issue"
   - "Y from your district"
   - "Most active thread: [thread type]"
   - Recent activity indicators

Keep the discussion UI clean and structured — this is NOT a typical comments section. The thread type grouping should make it feel organized and purposeful.
```

---

## Phase 7 — Pages

### Prompt 7.1 — Landing Page

```
PROMPT:

Build the RallyPoint landing page at src/app/(public)/page.tsx. This is the first thing users see — it needs to be compelling, clear, and motivating. Target audience: college students, young adults, first-time voters.

Design direction: bold, energetic, empowering. NOT a generic SaaS landing page. Think "civic energy" — the feeling of a community rally mixed with clean product design.

Sections:

1. Hero:
   - Large headline: "Your voice matters here." or similar empowering message
   - Subheading: 1-2 sentences about discovering and acting on local issues
   - Two CTAs: "Get Started" (sign up) and "Explore Issues" (goes to public discover)
   - Background: abstract civic-themed illustration or pattern (use CSS/SVG, not images). Could be an abstract map pattern, geometric shapes suggesting community connections, or a subtle grid representing districts.
   - Show a floating preview of a CivicItemCard (static mock) to give visitors a taste

2. How It Works:
   - 3-4 steps with icons: Discover → Understand → Engage → Impact
   - Brief descriptions for each
   - Animate in on scroll

3. Issue Categories:
   - Visual grid of category cards (Housing, Education, Transit, etc.) with icons
   - "See what's happening near you" — each card could show a count like "12 active issues"

4. Impact Stats (mock data for now):
   - Large animated counters: "2,400+ students engaged", "180+ local issues tracked", "15 districts covered"
   - These should feel impressive and motivating

5. Trust & Safety:
   - Brief section: "Built for real civic participation"
   - Points about verified actions, moderation, no spam, AI transparency

6. CTA:
   - "Ready to make your voice heard?" with sign-up button
   - Optional: "Already have an account? Sign in"

Make it a single scrollable page. Add smooth scroll animations (CSS-only, use Intersection Observer for scroll triggers). Mobile-first — looks great on phones. The whole page should feel like it takes 30 seconds to scan and motivates action.
```

---

### Prompt 7.2 — Onboarding Flow

```
PROMPT:

Build the RallyPoint onboarding flow at src/app/(auth)/onboarding/page.tsx.

This runs after first sign-up. It's a multi-step form that collects user context to personalize their experience. It should feel welcoming and fast (3-4 steps, not a long form).

Step 1 — "What do you care about?"
- Display the civic category grid (from constants) as selectable cards
- User picks 2-5 interests
- Each card shows category icon, name, and a one-line example ("How your rent gets decided")
- Multi-select with visual selection state (border highlight + checkmark)

Step 2 — "Where are you?"
- Address input with autocomplete (or simple text input for MVP)
- Explain why: "We use your location to show issues that affect YOUR neighborhood, district, and campus."
- Option to skip: "I'll add this later" — but show a note that the feed will be less personalized
- On submit, call the address validation API

Step 3 — "Quick intro to local government"
- Brief, visual explainer: "Here's how decisions get made near you"
- Show a simple diagram: City Council → County → State → Federal
- Highlight: "RallyPoint focuses on city and county — where YOUR voice has the biggest impact"
- Optional: if we know their district from Step 2, show "You're in Tempe City Council District 5"
- This step is educational, no user input required. Just a "Got it" button.

Step 4 — "You're ready!"
- Welcome message with user's name
- Show 2-3 preview issue cards relevant to their interests/location
- "Go to my feed" button that calls the onboarding API and redirects to home

Use React state to manage steps (no URL changes). Add a progress indicator (dots or progress bar). Animate transitions between steps (slide left/right). Allow back navigation.

Store all data at the end in one API call to /api/user/onboarding.
```

---

### Prompt 7.3 — Home Feed & Discover

```
PROMPT:

Build the main home feed and discover pages.

1. src/app/(auth)/home/page.tsx — Personalized Home Feed:
   - Server component that fetches initial feed data
   - Sections:
     * "Happening near you" — issues in user's districts, sorted by deadline urgency
     * "Trending in your community" — issues with most engagement recently
     * "Based on your interests" — issues matching user's selected categories
     * "New this week" — recently added items
   - Each section is a horizontal scrollable card row on mobile, grid on desktop
   - If user hasn't completed onboarding, show a banner prompting them to complete it
   - If user has no address, show a location prompt banner
   - Pull to refresh on mobile (or refresh button)

2. src/app/(auth)/discover/page.tsx — Filtered Discovery:
   - Full-page issue browser with filters
   - Filter sidebar (desktop) / filter sheet (mobile):
     * Category multi-select
     * Type multi-select
     * Jurisdiction level
     * Status (Active, Closed, All)
     * Sort by (Deadline, Newest, Trending, Most Supported)
     * Search text input
   - Results grid of CivicItemCards
   - Pagination
   - URL-based filter state (use searchParams so filters are shareable/bookmarkable)
   - Empty state: "No issues found matching your filters" with suggestions
   - If search query exists, highlight matching terms in card titles/summaries

3. src/hooks/useCivicFeed.ts:
   - Custom hook using @tanstack/react-query to fetch feed data
   - Handles pagination, filters, loading states, error states
   - Optimistic update support for engagement actions

4. src/hooks/useEngagement.ts:
   - Custom hook for civic item engagement actions
   - useMutation with optimistic updates
   - Handles toggle actions (save/unsave, support/unsupport)
   - Shows toast notifications on success/error

Both pages should feel fast and dynamic. Use skeleton loading states while data loads. The feed should feel like a curated news feed, not a database table.
```

---

### Prompt 7.4 — Impact Dashboard

```
PROMPT:

Build the impact dashboard page at src/app/(auth)/impact/page.tsx.

This is where users see the tangible result of their civic participation. It should feel rewarding and motivating — like a fitness app dashboard but for democracy.

Layout:

Top section — Personal Stats:
- Large stat cards in a row:
  * Issues Explored (eye icon, count)
  * Actions Taken (lightning icon, count)
  * Support Given (heart icon, count)
  * Comments Posted (message icon, count)
- Engagement streak: "🔥 5 day streak" with flame animation
- Small text: "You're more civically active than 73% of users in Tempe" (can be mock for MVP)

Middle section — Activity Timeline:
- Vertical timeline of recent activity
- Each entry: icon + "You supported Rent Stabilization Ordinance" + timestamp
- Group by day
- Load more pagination

Side section (desktop) / below on mobile — Categories Breakdown:
- Recharts pie chart or donut chart showing engagement by category
- Bar chart showing actions by type (views vs saves vs support vs comments)

Bottom section — Community Impact:
- "Your Community This Week" header
- Metric cards:
  * "247 students engaged this week" (with trend arrow up/down)
  * "12 new issues added"
  * "Rent Stabilization reached 80% support"
- Trending issues mini-list (top 3 by engagement velocity)
- District leaderboard: "Most active districts" — simple ranked list

Create the data fetching hooks:
- src/hooks/usePersonalImpact.ts (fetches /api/user/impact)
- src/hooks/useCommunityImpact.ts (fetches /api/community/impact)

Add skeleton loading states for all sections. Make the stats animate counting up when they appear (number animation). The whole page should feel like "look at the difference you're making."
```

---

### Prompt 7.5 — Admin Dashboard

```
PROMPT:

Build the admin/organizer dashboard at src/app/admin/page.tsx and sub-pages. Protect all admin routes with requireRole(['ORGANIZER', 'MODERATOR', 'ADMIN']).

1. src/app/admin/layout.tsx:
   - Admin-specific sidebar with: Overview, Civic Items, Moderation, Analytics, Users (admin only)
   - Different from the main app shell — more data-dense, less playful

2. src/app/admin/page.tsx — Overview:
   - Key metrics cards: Total items, Active items, Total engagements today, Pending moderation flags, New users this week
   - Recent activity feed (last 10 engagement events across all users)
   - Quick actions: "Add Civic Item", "Review Flags"

3. src/app/admin/items/page.tsx — Civic Item Management:
   - Table view of all civic items with columns: Title, Type, Status, Category, Support, Deadline, Verified
   - Filters and search
   - Row actions: Edit, View, Toggle Status, Trigger AI Summary
   - "Add New Item" button → form page

4. src/app/admin/items/new/page.tsx — Add/Edit Civic Item:
   - Form with all CivicItem fields
   - Source document upload (file input, stores text content)
   - "Generate AI Summary" button that triggers the summarization job
   - Preview of AI summary once generated
   - Save as Draft or Publish

5. src/app/admin/moderation/page.tsx — Moderation Queue:
   - List of flagged comments with: comment text, reporter reason, reported user, civic item context
   - Actions: Dismiss Flag, Hide Comment, Remove Comment, Warn User
   - Toxicity score display
   - Filter by status: Pending, Reviewed, Actioned

6. Create necessary API routes:
   - src/app/api/admin/civic-items/route.ts — CRUD for civic items (admin only)
   - src/app/api/admin/moderation/route.ts — GET flags, POST review action
   - src/app/api/admin/analytics/route.ts — engagement analytics data

Use shadcn/ui Table, Dialog, Form components. The admin UI should be functional and data-dense — this is a tool for organizers, not end users.
```

---

## Phase 8 — Moderation & Safety

### Prompt 8.1 — Moderation Pipeline

```
PROMPT:

Build the moderation and trust/safety pipeline for RallyPoint.

1. src/lib/moderation/pipeline.ts:
   Main moderation pipeline that processes new comments:
   - Step 1: Sanitize HTML (using sanitize-html, strip all tags except basic formatting)
   - Step 2: Check text length (10-2000 chars)
   - Step 3: Run Claude toxicity check (from lib/ai/claude.ts)
   - Step 4: Decision logic:
     * Score < 0.3 → AUTO_APPROVE (status: VISIBLE)
     * Score 0.3-0.7 → AUTO_APPROVE but log for review
     * Score > 0.7 → AUTO_FLAG (status: FLAGGED, create ModerationFlag)
     * Score > 0.9 → AUTO_HIDE (status: HIDDEN, create ModerationFlag with HIGH severity)
   - Return { approved: boolean, status, score, flags }

2. src/lib/moderation/fraud.ts:
   Fraud detection helpers:
   - checkRapidActions(userId): query EngagementEvents, if > 50 actions in last 5 minutes, create FraudSignal
   - checkDuplicatePatterns(userId, action, civicItemId): detect if same action taken and reversed repeatedly
   - logFraudSignal(signal): stores in FraudSignal table

3. src/lib/moderation/ratelimit.ts:
   Redis-based rate limiting:
   - rateLimit(key, maxRequests, windowSeconds): sliding window rate limiter
   - Returns { allowed: boolean, remaining: number, resetIn: number }
   - Pre-built keys: `comment:${userId}`, `engage:${userId}`, `api:${ip}`

4. Update the comment creation API to run through the full pipeline:
   - Sanitize → validate → rate limit → toxicity check → fraud check → save
   - If any check fails, return appropriate error without revealing internal scoring

5. src/lib/moderation/audit.ts:
   - createAuditEntry(params): append-only audit log helper
   - Logs: userId, action, entityType, entityId, metadata (includes result of checks), ipHash
   - For high-value actions (SUPPORT, SIGN, VOLUNTEER), always create audit entry
   - Never store raw IP — always hash with a server-side salt

6. Create civility rules constant at src/constants/civility.ts:
   Export CIVILITY_RULES: array of rule strings shown to users before commenting:
   - "Focus on the issue, not the person"
   - "Share evidence when making claims"
   - "Respect different perspectives"
   - "No personal attacks or harassment"
   - "Stay on topic"
```

---

## Phase 9 — Profile & Settings

### Prompt 9.1 — User Profile Page

```
PROMPT:

Build the user profile page at src/app/(auth)/profile/page.tsx.

1. Profile header:
   - Avatar (from Clerk), display name, member since date
   - Location: "Tempe, AZ" (city/state only)
   - Interest tags as colored badges
   - Edit button → opens edit mode

2. Edit mode (inline or modal):
   - Update display name
   - Update interests (same multi-select grid as onboarding)
   - Update address (re-runs geovalidation)
   - Save/Cancel

3. Engagement summary:
   - Mini version of impact stats: issues viewed, supported, commented
   - Link to full impact dashboard

4. Saved Items section:
   - Grid of saved CivicItemCards
   - "View all saved" link

5. Recent Activity:
   - Last 10 engagement events as a simple list

6. Account section:
   - Manage account (links to Clerk profile)
   - Privacy note: "Your address is used to personalize your feed and is never shared publicly. Only your city and state are visible to others."
   - Delete account option (marks user inactive, doesn't hard delete — note this for GDPR-style compliance)

Use the existing components (CivicItemCard, CategoryBadge) wherever possible. The profile should feel personal but not overloaded.
```

---

## Phase 10 — Final Integration & Polish

### Prompt 10.1 — End-to-End Wiring & Error States

```
PROMPT:

Wire up remaining integration points and add error/empty states across the app.

1. Global error handling:
   - src/app/error.tsx — global error boundary with friendly message and retry button
   - src/app/not-found.tsx — custom 404 page with search suggestion and link to home
   - src/app/(auth)/issues/[slug]/not-found.tsx — issue-specific 404

2. Loading states:
   - src/app/(auth)/home/loading.tsx — skeleton grid of CivicItemCardSkeletons
   - src/app/(auth)/discover/loading.tsx — skeleton with filter sidebar placeholder
   - src/app/(auth)/impact/loading.tsx — skeleton stat cards and chart placeholders

3. Empty states (create a reusable EmptyState component):
   - No feed items: "No issues found in your area yet. Try expanding your interests or check back soon."
   - No saved items: "You haven't saved any issues yet. Browse the feed and bookmark items you want to track."
   - No comments: "Be the first to discuss this issue."
   - No search results: "No results for '[query]'. Try different keywords."
   Each with an illustration/icon, message, and suggested action button.

4. Toast notifications:
   - Set up shadcn/ui Toaster in root layout
   - Success toasts for: support given, comment posted, item saved, profile updated
   - Error toasts for: rate limited, auth required, action failed

5. Verify all API routes are called correctly from their respective pages/components.

6. Add meta tags and OpenGraph data:
   - src/app/layout.tsx: default metadata (title, description, OG image placeholder)
   - Issue detail page: dynamic metadata from civic item (title, summary as description)

7. Create src/lib/utils/share.ts:
   - shareIssue(item): uses Web Share API if available, falls back to clipboard copy
   - generateShareUrl(slug): returns full URL for the issue
   - generateShareText(item): returns shareable text snippet
```

---

### Prompt 10.2 — Performance & Production Readiness

```
PROMPT:

Add performance optimizations and production readiness improvements.

1. Caching strategy:
   - Review all API routes and add appropriate Redis caching:
     * Feed endpoints: 5 minute TTL, invalidate on new civic item or engagement milestone
     * Community impact: 15 minute TTL
     * User profile: no cache (always fresh)
     * Static data (categories, districts): 1 hour TTL
   - Create src/lib/cache/keys.ts with centralized cache key generators
   - Create src/lib/cache/invalidate.ts with helpers to invalidate related caches

2. Database query optimization:
   - Review Prisma queries for N+1 problems, add proper includes/selects
   - Add database indexes if any are missing (review query patterns)
   - Use Prisma's select to only fetch needed fields in list views

3. Image/asset optimization:
   - Ensure Next.js Image component is used for any images
   - Add proper font loading with next/font for Plus Jakarta Sans and DM Sans

4. Security headers:
   - Create/update next.config.js with security headers:
     * Content-Security-Policy
     * X-Frame-Options
     * X-Content-Type-Options
     * Referrer-Policy
     * Permissions-Policy

5. Environment validation:
   - Create src/lib/env.ts using Zod to validate all required env vars at startup
   - Fail fast with clear error messages if vars are missing

6. Create a README.md with:
   - Project description
   - Tech stack
   - Setup instructions (clone, install, env vars, database setup, seed, run)
   - Project structure overview
   - Available scripts
   - Deployment notes (Vercel recommended)
```

---

## Supplementary Prompts (Use As Needed)

### Prompt S.1 — Add Maps Integration

```
PROMPT:

Add Mapbox GL map integration to RallyPoint for visualizing civic issues geographically.

1. Install mapbox-gl and @types/mapbox-gl (or react-map-gl for React wrapper)

2. src/components/maps/IssueMap.tsx:
   - Interactive map centered on user's location (or Tempe as default)
   - Renders civic items as map markers, colored by category
   - Clicking a marker shows a popup with mini issue card (title, category, deadline, support count)
   - Cluster markers when zoomed out
   - Filter markers by the same filters available on the Discover page

3. src/components/maps/DistrictOverlay.tsx:
   - Renders district boundaries as polygon overlays on the map
   - Highlight user's districts
   - Show district label on hover

4. Add map view toggle to the Discover page (list view vs map view)

5. Add a small map preview on the issue detail page showing the issue's location with district context.
```

---

### Prompt S.2 — Notification System

```
PROMPT:

Build a basic in-app notification system for RallyPoint.

1. Database:
   Add a Notification model to Prisma schema:
   - id, userId, type (DEADLINE_APPROACHING, ISSUE_UPDATE, MILESTONE_REACHED, COMMENT_REPLY, MODERATION_ACTION), title, body, linkUrl, read (boolean), createdAt

2. src/lib/notifications/create.ts:
   - createNotification(userId, type, data): creates notification record
   - notifyDeadlineApproaching(civicItemId): finds users who saved/supported the item, creates notifications for those within 3 days of deadline
   - notifyMilestoneReached(civicItemId, milestone): notifies supporters when support target hits 25/50/75/100%
   - notifyCommentReply(commentId): notifies parent comment author

3. src/app/api/notifications/route.ts:
   - GET: returns user's notifications, newest first, paginated
   - PATCH: mark as read (single or bulk)

4. src/components/layout/NotificationBell.tsx:
   - Bell icon in TopBar with unread count badge
   - Dropdown showing recent notifications
   - Click notification → navigate to linked issue/comment
   - "Mark all as read" button

5. src/hooks/useNotifications.ts:
   - Polls for new notifications every 60 seconds (or use polling with react-query refetchInterval)
   - Returns unread count and notification list
```

---

### Prompt S.3 — Representative Contact Flow

```
PROMPT:

Build the "Contact Your Representative" action flow.

1. src/constants/representatives.ts:
   - Mock data: array of representative objects for Tempe/Phoenix area
   - Each: name, title, office, district, email, phone, officeAddress, photoUrl, website
   - Include city council members, state legislators, county supervisors

2. src/lib/geo/representatives.ts:
   - getRepresentatives(districtIds: string[]): returns representatives matching user's districts
   - For MVP, uses the mock data. Add comment for future integration with Google Civic Information API or OpenStates API.

3. src/components/civic/ContactRepFlow.tsx:
   - Step 1: Show relevant representatives based on the civic item's jurisdiction and user's districts
   - Step 2: Choose contact method (Email, Phone, Office Visit)
   - Step 3: If email:
     * Pre-filled email template with: subject referencing the civic item, body with user's position, talking points from the AI summary
     * "Open in Mail" button (mailto: link)
     * Or copy to clipboard
   - Step 4: Confirmation — "Did you send it?" → records CONTACT_REP engagement event

4. Add this flow as a modal/sheet triggered from the Action Ladder's "Contact Representative" step.
```

---

## Build Order Summary

For quick reference, here's the recommended sequence:

```
Phase 0: Scaffolding (0.1, 0.2)
Phase 1: Database (1.1, 1.2)
Phase 2: Types & Utils (2.1)
Phase 3: Auth & Geo (3.1, 3.2)
Phase 4: AI Pipeline (4.1)
Phase 5: Core APIs (5.1, 5.2)
Phase 6: UI Components (6.1 → 6.2 → 6.3 → 6.4)
Phase 7: Pages (7.1 → 7.2 → 7.3 → 7.4 → 7.5)
Phase 8: Moderation (8.1)
Phase 9: Profile (9.1)
Phase 10: Polish (10.1, 10.2)
Supplementary: S.1, S.2, S.3 as needed
```

Each phase builds on the previous. Don't skip ahead — later prompts assume earlier work exists.
