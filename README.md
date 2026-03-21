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

### Installation

1. **Install dependencies**:

```bash
npm install
# or
pnpm install
```

2. **Set up environment variables**:

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required variables:**
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rallypoint"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk Auth (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Claude AI (get from https://console.anthropic.com)
ANTHROPIC_API_KEY="sk-ant-..."

# Application
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Security (generate with: openssl rand -base64 32)
SECURITY_SALT="your-random-32-char-string"
```

**Optional variables:**
```env
# Rate limiting overrides
RATE_LIMIT_COMMENTS_PER_HOUR=10
RATE_LIMIT_ENGAGEMENTS_PER_MINUTE=30

# Feature flags
ENABLE_AI_SUMMARIES=true
ENABLE_MODERATION=true
ENABLE_FRAUD_DETECTION=true
```

See `.env.example` for complete documentation of all environment variables.

3. **Set up the database**:

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with Arizona test data
npm run prisma:seed
```

4. **Run the development server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📊 Database Schema

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

- 3 users (student, organizer, admin)
- 8 civic items covering housing, transit, education, environment, etc.
- AI summaries for 3 items
- Sample engagements, comments, and organizer updates

All data is specific to Tempe/Phoenix/Maricopa County.

## 🗺️ Arizona-Specific Features

- **Districts**: Tempe City Council, AZ Legislative, Congressional districts
- **Jurisdictions**: City, County, State, Campus (ASU), School Districts
- **Geocoding**: ZIP code to district mapping (upgradeable to PostGIS)
- **Representatives**: Local elected officials contact info

## 📝 Available Scripts

```bash
# Development
pnpm dev             # Start development server (http://localhost:3000)
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run ESLint

# Database
pnpm prisma:generate # Generate Prisma client
pnpm prisma:push     # Push schema to database (development)
pnpm prisma:migrate  # Run migrations (production)
pnpm prisma:seed     # Seed database with Arizona test data
pnpm prisma:studio   # Open Prisma Studio GUI

# Type checking
pnpm type-check      # Run TypeScript compiler check
```

### First-Time Setup Checklist

1. ✅ Install PostgreSQL and Redis locally
2. ✅ Create Clerk account and application
3. ✅ Get Anthropic API key
4. ✅ Copy `.env.example` to `.env.local` and fill in values
5. ✅ Run `pnpm install`
6. ✅ Run `pnpm prisma:generate`
7. ✅ Run `pnpm prisma:push`
8. ✅ Run `pnpm prisma:seed`
9. ✅ Set up Clerk webhook for user sync
10. ✅ Run `pnpm dev` and visit http://localhost:3000

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

## 🛠️ Development Status

**Completed Phases:**
- ✅ Phase 0: Project scaffolding and configuration
- ✅ Phase 1: Database schema (12 models) and seed data
- ✅ Phase 2: TypeScript types, constants, utilities
- ✅ Phase 3: Auth (Clerk) & Geo-validation
- ✅ Phase 4: Claude AI integration (summarization + toxicity)
- ✅ Phase 5: Core API routes (civic items, comments, users, admin)
- ✅ Phase 6: UI components (cards, badges, action ladder, discussion)
- ✅ Phase 7: Pages (Landing, Feed, Detail, Impact, Saved, Profile, Moderation)
- ✅ Phase 8: Moderation pipeline, fraud detection, audit logging
- ✅ Phase 9: Profile page with inline editing
- ✅ Phase 10: Error boundaries, loading states, caching, security headers

**Ready for local testing and deployment!**

## 📖 Documentation

### Core Documentation
- `rallypoint-claude-code-prompts.md` - Detailed phase-by-phase build instructions
- `CACHING_STRATEGY.md` - Complete caching architecture and invalidation patterns

### API Documentation

All API routes follow RESTful conventions and return standardized responses:

```typescript
// Success response
{
  success: true,
  data: T,
  pagination?: { page, pageSize, totalCount, totalPages }
}

// Error response
{
  success: false,
  error: string
}
```

**Public Routes:**
- `GET /api/civic-items` - List civic items with filtering
- `GET /api/civic-items/[slug]` - Get single civic item
- `GET /api/civic-items/[slug]/comments` - Get comments

**Authenticated Routes:**
- `POST /api/civic-items/[slug]/engage` - Take engagement action
- `POST /api/civic-items/[slug]/comments` - Post comment
- `POST /api/comments/[id]/flag` - Flag comment for moderation
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile
- `GET /api/user/saved` - Get saved items
- `GET /api/user/impact` - Get impact stats

**Admin Routes** (require MODERATOR or ADMIN role):
- `GET /api/admin/moderation` - Get moderation queue
- `POST /api/admin/moderation` - Review flagged content

### Architecture Highlights

**Middleware Composition:**
```typescript
// Example: Authenticated + Validated + Rate Limited
export const POST = compose(
  withRateLimit((req, user) => `engage:${user?.id}`, 30, 60),
  withValidation(engageSchema),
  withAuth
)(handler)
```

**Cache Invalidation:**
```typescript
// When civic item updates, invalidate all related caches
await invalidateCivicItem(itemId, slug)
// Invalidates: item cache, feed queries, trending, personalized feeds
```

**Moderation Pipeline:**
```typescript
// 4-tier toxicity scoring
if (score < 0.3) → ACTIVE (auto-approve)
if (score >= 0.3 && < 0.7) → ACTIVE (with suggestion)
if (score >= 0.7 && < 0.9) → FLAGGED (manual review)
if (score >= 0.9) → HIDDEN (auto-hide)
```

**Security Features:**
- Comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting with Redis sliding window
- IP hashing with SHA-256 + salt for privacy
- HTML sanitization on all user input
- Zod validation on all API inputs
- Role-based access control

## 🚨 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

**Redis Connection Error:**
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Verify REDIS_URL format
redis://localhost:6379
```

**Clerk Webhook 401:**
- Verify `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard > Webhooks
- Ensure webhook endpoint is accessible (use ngrok for local testing)
- Check webhook is set to `user.created` and `user.updated` events

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
pnpm prisma:generate

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Environment Validation Failed:**
- Ensure all required variables in `.env.example` are set
- Check for typos in variable names
- Verify API keys are valid and not expired

## 🤝 Contributing

This is a civic engagement platform built for the community. Contributions are welcome!

### Development Guidelines

- Use TypeScript for all new code
- Follow existing patterns for API routes and components
- Add Zod schemas for all API inputs
- Write descriptive commit messages
- Test locally before pushing
- Update documentation for new features

## 📄 License

ISC

## 🙏 Acknowledgments

Built for civic engagement in Tempe, Phoenix, and Maricopa County, Arizona.
Powered by Claude AI, designed for first-time civic participants.

---

**Note**: This project uses real Arizona geography and government structure, but seed data is fictional and for testing purposes only.
