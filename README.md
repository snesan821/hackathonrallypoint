# RallyPoint

A civic engagement platform focused on Tempe, Phoenix, and Maricopa County, Arizona. RallyPoint helps students and community members discover, understand, and take action on local civic issues.

Our platform helps underrepresented demographics discover local campaigns, petitions, and initiatives through a personalized feed that makes civic issues easy to understand. With AI summaries, recommendations, community updates, and impact tracking, it makes participation more accessible, social, and engaging.

## 🎯 Project Overview

RallyPoint is designed to make civic participation accessible and engaging. The platform features:

- **AI-Powered Summaries**: Claude AI breaks down complex civic documents into plain language
- **Personalized Feed**: Issues relevant to your district and interests
- **Action Ladder**: Progressive engagement from learning to taking action
- **Community Discussion**: Structured, moderated conversations on civic issues
- **Impact Tracking**: See the tangible results of your civic participation

## 🏗️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (ioredis)
- **Auth**: Clerk
- **AI**: Claude (Anthropic)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Query (@tanstack/react-query)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (auth)/             # Protected routes
│   ├── (public)/           # Public routes
│   ├── admin/              # Admin dashboard
│   └── api/                # API route handlers
├── components/
│   ├── ui/                 # shadcn primitives
│   ├── layout/             # App shell, navigation
│   ├── civic/              # Issue cards, action ladder
│   ├── community/          # Discussion components
│   ├── maps/               # Map visualization
│   └── onboarding/         # User onboarding flow
├── lib/
│   ├── db/                 # Prisma client
│   ├── ai/                 # Claude integration
│   ├── geo/                # Geocoding, district lookup
│   ├── auth/               # Clerk helpers
│   ├── moderation/         # Content moderation
│   ├── cache/              # Redis client
│   └── utils/              # Utilities
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript types
├── constants/              # App-wide constants
└── styles/                 # Global styles

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed data
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance
- Clerk account (for authentication)
- Anthropic API key (for Claude AI)


The database includes 12 core models:

1. **User** - Platform users with roles and onboarding status
2. **UserAddress** - Geocoded addresses with district mappings
3. **UserInterest** - User's civic interest categories
4. **CivicItem** - Civic issues, petitions, ordinances, etc.
5. **SourceDocument** - Uploaded/linked documents
6. **AISummary** - Claude-generated summaries
7. **EngagementEvent** - User interactions (views, saves, support, etc.)
8. **Comment** - Threaded discussions
9. **ModerationFlag** - User-reported content
10. **OrganizerUpdate** - Updates from issue organizers
11. **AuditLog** - Append-only action log
12. **FraudSignal** - Suspicious activity tracking

## 🧪 Seed Data

The seed script (`prisma/seed.ts`) includes realistic Arizona test data:

-  users (student, organizer, admin)
-  civic items covering housing, transit, education, environment, etc.
- AI summaries for  items
- Sample engagements, comments, and organizer updates

All data is specific to Tempe/Phoenix/Maricopa County.

## 🗺️ Arizona-Specific Features

- **Districts**: Tempe City Council, AZ Legislative, Congressional districts
- **Jurisdictions**: City, County, State, Campus (ASU), School Districts
- **Geocoding**: ZIP code to district mapping (upgradeable to PostGIS)
- **Representatives**: Local elected officials contact info


## 🔑 Key Features

### AI Summarization

Claude AI analyzes civic documents and generates:
- Plain language summary (8th grade reading level)
- Who's affected
- What changes
- Why it matters
- Arguments for and against
- Important dates
- Next actions

### Action Ladder

Progressive engagement levels:
1. View → 2. Save → 3. Share → 4. Comment → 5. Support → 6. Contact Rep → 7. RSVP → 8. Volunteer → 9. Sign → 10. Download Form

### Moderation Pipeline

- AI toxicity detection (Claude)
- HTML sanitization
- Rate limiting
- Fraud detection
- Manual moderation queue

**Security Features:**
- Comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting with Redis sliding window
- IP hashing with SHA-256 + salt for privacy
- HTML sanitization on all user input
- Zod validation on all API inputs
- Role-based access control
