# RallyPoint - Hackathon Demo Script
**Duration: 7-8 minutes | Professional & Engaging**

---

## 🎬 OPENING (0:00 - 0:30)

**[SCREEN: Landing page - hero section visible]**

**SPEAKER:**
"Meet RallyPoint - a civic engagement platform that makes local democracy accessible to everyone. We built this for students and community members in Tempe, Phoenix, and Maricopa County who want to make a difference but don't know where to start.

The problem? Civic participation is intimidating. Government websites are confusing, petitions are scattered across platforms, and most people have no idea what's happening in their own backyard.

RallyPoint changes that. Let me show you how it works from a brand new user's perspective."

**[CUE: Click "Get Started" button]**

---

## 🔐 SIGN UP - CLERK AUTHENTICATION (0:30 - 1:15)

**[SCREEN: Clerk sign-up modal appears]**

**SPEAKER:**
"We use Clerk for authentication - industry-standard OAuth with social logins and secure session management. I'll create a new account to show you the complete onboarding experience."

**[CUE: Click "Sign up with Google" or fill in email/password]**

**SPEAKER:**
"Clerk handles all the security - password hashing, email verification, session tokens. As developers, we just focus on building features."

**[CUE: Complete sign-up process]**

**SPEAKER:**
"Behind the scenes, Clerk fires a webhook to our API, which creates a user record in our PostgreSQL database with Prisma ORM. This keeps authentication and user data perfectly synced."

**[SCREEN: Redirect to onboarding page]**

---

## 🎯 ONBOARDING - PERSONALIZATION (1:15 - 2:15)

**[SCREEN: Onboarding page - interest selection]**

**SPEAKER:**
"Here's where RallyPoint gets personal. New users select their civic interests from categories like housing, education, transportation, environment, public safety, and more."

**[CUE: Hover over different category cards to show icons]**

**SPEAKER:**
"These aren't just tags - they power our entire recommendation engine. Your feed, your swipe stack, everything is filtered based on what you care about."

**[CUE: Select 3-4 categories: HOUSING, EDUCATION, TRANSPORTATION, ENVIRONMENT]**

**SPEAKER:**
"I'll select housing, education, transportation, and environment. Notice the visual feedback - selected cards highlight with our primary color."

**[CUE: Click "Continue" button]**

**[SCREEN: Address input screen appears]**

**SPEAKER:**
"Next, we need your location. This is crucial - civic engagement is hyperlocal. You can't vote on a Tempe city council issue if you live in Phoenix."

**[CUE: Start typing address in input field]**

**SPEAKER:**
"Enter your address, and we automatically map you to your districts: city council, state legislative, congressional, school board. This ensures you only see issues you can actually influence."

**[CUE: Type "123 E University Dr, Tempe, AZ 85281" or similar]**

**SPEAKER:**
"The system validates your address, extracts your ZIP code, city, and county, then stores it securely. In a production version, we'd use PostGIS for precise district boundary matching."

**[CUE: Click "Complete Onboarding" button]**

**[SCREEN: Brief loading state, then redirect to Discover page]**

**SPEAKER:**
"And just like that, you're in. Onboarding complete. Now let's see what RallyPoint can do."

---

## 🎯 DISCOVER - SWIPE INTERFACE (2:15 - 3:30)

**[SCREEN: Discover page - swipe mode]**

**SPEAKER:**
"This is Discover - our Tinder-style swipe interface for civic issues. We scraped real data from government websites using TinyFish AI agents.

Watch how this works:"

**[CUE: Swipe right on first card]**

**SPEAKER:**
"Swipe right to follow an issue. This adds it to your Following list."

**[CUE: Swipe left on next card]**

**SPEAKER:**
"Swipe left to skip. The card disappears."

**[CUE: Tap support button on next card]**

**SPEAKER:**
"Or tap Support to show you care. The counter increments in real-time, and this action is tracked for your impact stats."

**[CUE: Switch to Browse mode]**

**SPEAKER:**
"Not a swiper? Switch to Browse mode. Filter by category - housing, education, public safety. Every issue is tagged and categorized automatically."

---

## 📰 FEED - PERSONALIZED CONTENT (3:30 - 4:30)

**[SCREEN: Navigate to Feed page]**

**SPEAKER:**
"The Feed shows issues relevant to your location and interests. Notice the filters - sort by deadline, trending, or most supported."

**[CUE: Show filter dropdowns]**

**SPEAKER:**
"Each card shows key information at a glance: category badge, deadline chip, support counter, and engagement stats."

**[CUE: Hover over a card]**

**SPEAKER:**
"The Quick Actions bar lets you follow, share, or support without leaving the feed. State persists everywhere - if you follow something here, it shows as followed across the entire app."

**[CUE: Click Follow button, show it changes to "Following"]**

**SPEAKER:**
"See? Instant feedback. This uses optimistic UI updates with error rollback - if the API fails, the button reverts."

---

## 📋 ISSUE DETAIL - DEEP DIVE (4:30 - 5:45)

**[SCREEN: Click on an issue card to open detail page]**

**SPEAKER:**
"Here's where RallyPoint really shines. Every issue has a detailed view with three tabs: Full Details, Discussion, and Updates."

**[CUE: Show Full Details tab]**

**SPEAKER:**
"The description is comprehensive - we used Claude AI to generate plain-language summaries from complex government documents. No legal jargon, just clear explanations of what's happening and why it matters."

**[CUE: Scroll to show Action Ladder on right side]**

**SPEAKER:**
"This is the Action Ladder - progressive engagement from low to high effort. View, save, share, comment, support, contact your representative, RSVP to meetings, volunteer, or sign petitions. Each action is tracked and contributes to your impact score."

**[CUE: Click Discussion tab]**

**SPEAKER:**
"The Discussion tab has structured, threaded comments. Users can ask questions, voice support or concerns, or share evidence. We built AI-powered moderation using Claude to detect toxic content before it goes live."

**[CUE: Scroll through comments]**

**SPEAKER:**
"Every comment is sanitized for XSS attacks, rate-limited to prevent spam, and flaggable by users. Moderators review flagged content in the admin dashboard."

---

## 💪 IMPACT PAGE - GAMIFICATION (5:45 - 6:30)

**[SCREEN: Navigate to Impact page]**

**SPEAKER:**
"This is your Impact page - gamification meets civic engagement. See your stats: issues viewed, followed, supported, comments posted, and actions taken."

**[CUE: Scroll through stats cards]**

**SPEAKER:**
"The community impact section shows collective progress. How many people engaged this week? Which issues are trending? This creates social proof and motivates continued participation."

**[CUE: Show recent activity feed]**

**SPEAKER:**
"Your recent activity is logged here. Every view, every follow, every support action is tracked. This isn't just for show - it's data we can share with organizers and elected officials to prove community interest."

---

## 💾 FOLLOWING PAGE - STATE MANAGEMENT (6:30 - 7:00)

**[SCREEN: Navigate to Saved/Following page]**

**SPEAKER:**
"Your Following page shows all issues you've saved. Notice the buttons say 'Following' and 'Supported' - state is maintained perfectly."

**[CUE: Click unfollow on an item]**

**SPEAKER:**
"Unfollow an issue, and it's removed instantly. This uses optimistic UI updates with cache invalidation. Behind the scenes, we're using Redis for caching and PostgreSQL with Prisma ORM for the database."

**[CUE: Show item disappears from list]**

**SPEAKER:**
"Gone. And if I go back to the feed..."

**[CUE: Navigate back to Feed]**

**SPEAKER:**
"...it shows as unfollowed. State consistency across the entire app."

---

## 🤖 TECH STACK HIGHLIGHT (7:00 - 7:30)

**[SCREEN: Open browser dev tools or show code editor briefly]**

**SPEAKER:**
"Let's talk tech. RallyPoint is built with Next.js 15 and TypeScript - fully type-safe from database to UI. We use:

- **Clerk** for authentication with webhook-based user sync
- **Prisma ORM** with PostgreSQL for our database - 12 models including users, civic items, engagements, comments, and moderation flags
- **Redis** for caching and rate limiting
- **Claude AI** by Anthropic for generating plain-language summaries and real-time toxicity detection
- **TinyFish AI agents** for automated web scraping from government websites

The entire app is responsive, mobile-first, and follows Material Design 3 principles with Tailwind CSS."

**[CUE: Show mobile view or resize browser]**

**SPEAKER:**
"On mobile, we hide the desktop nav and show a bottom bar. Touch interactions feel native - no tap highlights, smooth transitions, and press feedback on every button."

---

## 🎯 CLOSING - MISSION & IMPACT (7:30 - 8:00)

**[SCREEN: Return to landing page or Impact page]**

**SPEAKER:**
"RallyPoint isn't just another civic tech project. It's designed for first-time participants - students, young professionals, anyone who cares but doesn't know how to get involved.

We make civic engagement:
- **Accessible** - plain language, no jargon
- **Personalized** - your district, your interests
- **Social** - see what your community cares about
- **Actionable** - clear next steps, not just information

Every feature is intentional. The swipe interface lowers the barrier to entry. The Action Ladder guides users from passive viewing to active participation. The impact tracking creates accountability and motivation.

This is civic engagement for the TikTok generation - fast, visual, and rewarding."

**[SCREEN: Show final stats or community impact]**

**SPEAKER:**
"RallyPoint. Democracy, simplified."

---

## 📝 TECHNICAL NOTES FOR RECORDING

### Screen Recording Setup
- **Resolution**: 1920x1080 or 1280x720
- **Frame rate**: 30fps minimum
- **Audio**: Clear microphone, minimal background noise
- **Browser**: Chrome or Firefox, clean profile (no extensions visible)
- **Zoom level**: 100% or 110% for readability

### Pre-Recording Checklist
- [ ] Database seeded with realistic data (use `npm run prisma:seed`)
- [ ] Create a NEW email for demo signup (not existing account)
- [ ] Clear browser cache and cookies
- [ ] All pages load without errors
- [ ] Network tab clear of failed requests
- [ ] Redis and PostgreSQL running
- [ ] .env variables properly set (especially CLERK keys)
- [ ] Practice the FULL signup flow (timing is critical)
- [ ] Have address ready to type: "123 E University Dr, Tempe, AZ 85281"

### Timing Breakdown
- Opening: 30 seconds
- Sign Up (Clerk): 45 seconds
- Onboarding: 60 seconds
- Discover: 75 seconds
- Feed: 60 seconds
- Issue Detail: 75 seconds
- Impact: 45 seconds
- Following: 30 seconds
- Tech Stack: 30 seconds
- Closing: 30 seconds
- **Total: 8:00** (exactly at limit)

### Backup Plan
If running over time, cut:
1. Following page demo (30 seconds saved)
2. Mobile responsive showcase (15 seconds saved)
3. Shorten tech stack to bullet points only (15 seconds saved)

### Energy & Tone
- **Pace**: Conversational but purposeful (140-160 words/minute)
- **Energy**: Enthusiastic but not overhyped
- **Tone**: Professional yet approachable
- **Avoid**: "Um," "like," long pauses, apologizing for bugs

### Visual Cues
- Use cursor to highlight important UI elements
- Smooth scrolling (not too fast)
- Pause briefly after each major action
- Keep mouse movements deliberate

---

## 🎥 POST-PRODUCTION TIPS

### Editing
- Add subtle background music (low volume, non-distracting)
- Include text overlays for key features: "TinyFish AI Scraping," "Claude AI Summarization," "Real-time State Management"
- Add transitions between major sections (simple fade or cut)
- Speed up slow loading screens (1.5x-2x)

### Captions
- Add closed captions for accessibility
- Highlight technical terms: Clerk, Prisma, Redis, Claude, TinyFish

### Thumbnail
- Use RallyPoint logo + "Civic Engagement Reimagined"
- Show swipe interface or impact dashboard
- High contrast, readable text

---

**Good luck with your hackathon submission! 🚀**
