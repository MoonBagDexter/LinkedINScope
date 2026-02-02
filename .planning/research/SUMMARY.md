# Project Research Summary

**Project:** LinkedInScope
**Domain:** Gamified Job Aggregator with Real-Time Engagement Tracking
**Researched:** 2026-02-02
**Confidence:** HIGH

## Executive Summary

LinkedInScope is a gamified job aggregator targeting service industry workers, combining "Product Hunt" style community curation with job discovery. Research shows this requires a real-time Next.js 16 application with Supabase backend, animated Kanban interface, and engagement-based lane migration. The recommended stack (Next.js 16 + React 19 + Supabase + Framer Motion) is well-documented with clear patterns for real-time features and server-side rendering.

The core differentiator—community-driven job discovery via click tracking—is novel and unproven. While job aggregator table stakes are well-established (search, filtering, quick apply), the gamified Kanban approach has no direct precedent. This creates both opportunity (unique value proposition) and risk (hypothesis requires validation). Service industry workers face information overload and algorithm fatigue, so transparent community curation could address real pain points.

Critical risks center on API quota exhaustion (JSearch free tier: 500 requests/month), Supabase Realtime message limits (free tier: quota based on message count), and click-based quality signal gaming. These pitfalls must be addressed in Phase 1 through aggressive caching, batched updates, and signal validation. The roadmap should prioritize validation over features—establish engagement tracking with anti-gaming measures before building advanced gamification. Privacy compliance (consent management, GPC signals) is non-negotiable from day one.

## Key Findings

### Recommended Stack

Next.js 16 with App Router provides the foundation, leveraging React 19 Server Components and Turbopack for optimal performance. Supabase handles authentication, Postgres database, and real-time subscriptions via WebSockets—perfect for multi-user engagement tracking. Tailwind CSS 4.0.7 (stable with Next.js 16) and Framer Motion 12.27.0+ (React 19 compatible) enable the playful, animated Kanban interface.

**Core technologies:**
- **Next.js 16.1+ / React 19.2+**: Full-stack framework with SSR/SSG, Server Components, and zero-config Vercel deployment
- **Supabase (Backend-as-a-Service)**: Postgres + real-time + auth in one platform, handles 10,000+ concurrent WebSocket connections
- **Tailwind CSS 4.0.7**: Utility-first styling included in Next.js template (v4.1.18 has known Turbopack issues)
- **Framer Motion 12.27.0+**: Declarative animations for lane transitions and card movements, officially supports React 19
- **@hello-pangea/dnd**: Drag-and-drop for Kanban (community-maintained fork of react-beautiful-dnd with same API)
- **JSearch API (RapidAPI)**: Job listings aggregated from Google for Jobs, LinkedIn, Indeed, Glassdoor—30+ data points per job

**Critical version constraints:**
- Node.js 20+ required (18 reached EOL April 2025)
- Tailwind CSS must be 4.0.7 (4.1.18 breaks with Turbopack)
- @supabase/ssr required for App Router auth (replaces old auth helpers)

### Expected Features

Service industry job boards demand mobile-first design (70%+ users on mobile), instant search/filtering by shift type and pay range, and seamless external application links. The gamified layer adds Kanban visualization, automatic lane migration based on engagement, and trending sections showing community-validated opportunities.

**Must have (table stakes):**
- **Search & Filter** — Location, job type, shift type, pay range (mobile-first implementation)
- **Job Listing Cards** — Instant-load cards with title, company, location, pay, date
- **External Quick Apply** — Click-through to original posting (track clicks, don't intermediate applications)
- **Mobile Responsiveness** — Not "mobile-friendly" but mobile-FIRST (service workers use phones primarily)
- **Basic Auth** — Email/password + Google OAuth minimum for saved jobs and personalization
- **Job Details View** — Full description modal with original posting content

**Should have (competitive advantage):**
- **Automatic Lane Migration** — Jobs move from New → Trending → Graduated based on click thresholds (core differentiator)
- **Kanban Visual Format** — Three-lane board instantly shows job "temperature" and trajectory
- **Trending Section** — Surfaces hot opportunities with community validation (wisdom of crowd)
- **Zero Algorithmic Manipulation** — Pure engagement drives visibility, no black box recommendations
- **Playful Animations** — Drag-and-drop feel, lane transitions, milestone celebrations (makes job hunting less soul-crushing)
- **Real-Time Movement** — Watch jobs migrate between lanes live (creates engagement and FOMO)

**Defer (v2+):**
- **Resume Upload/Hosting** — Scope creep, maintenance burden, privacy concerns (let employers own ATS complexity)
- **In-Platform Messaging** — Spam risk, moderation nightmare, liability issues
- **AI Job Matching** — Undermines core differentiator (community beats algorithms), expensive
- **Employer Posting Portal** — Two-sided marketplace complexity, LinkedIn already exists
- **Complex Gamification** — Badges/levels/streaks can feel manipulative (keep it light and transparent)
- **Social Features** — Comments/follows/DMs add moderation burden and dilute focus

**Anti-features (deliberately NOT building):**
- Infinite scroll (creates doomscrolling, prefer paginated lanes with clear counts)
- Real-time everything (save WebSockets for critical moments, use periodic refresh elsewhere)
- Salary negotiation tools (mission creep, existing solutions like Glassdoor)

### Architecture Approach

Client-server architecture with Next.js Server Components handling SSR and Server Actions managing mutations. Supabase provides the data layer (Postgres) and real-time engine (WebSocket subscriptions). State management uses React Context for UI state and optimistic updates for mutations. External API integration (JSearch) happens server-side via Server Actions to protect API keys.

**Major components:**
1. **Kanban UI Components** — React components with Framer Motion animations + @hello-pangea/dnd for drag interactions, handle local state and optimistic updates
2. **Server Actions** — Execute mutations (click tracking, lane migrations, job sync), revalidate cache, protect API keys server-side
3. **Supabase Realtime** — Table-level subscriptions with lane filtering, broadcast job updates via WebSocket to all connected clients
4. **Engagement Engine** — Server-side logic for threshold-based lane migrations, validates signals, prevents gaming
5. **Job Sync Scheduler** — Vercel Cron job fetches from JSearch API, transforms data, upserts to Supabase with deduplication

**Critical patterns:**
- **Realtime with Optimistic Updates**: Subscribe to table-level changes with filters (not per-row), use optimistic UI for instant feedback
- **Server Actions for Mutations**: All data changes go through Server Actions (not API routes), automatic CSRF protection and revalidation
- **Engagement-Based State Transitions**: Click thresholds trigger lane migrations, state persisted in database with RLS policies
- **Caching Layer**: 24-48 hour TTL on job data to avoid API exhaustion, Supabase as primary store (not cache)

### Critical Pitfalls

1. **API Rate Limit Exhaustion** — JSearch free tier (500 requests/month) exhausts quickly with engagement tracking. Solution: Aggressive 24-48 hour caching, decouple click tracking from API calls, use Supabase as primary job store (API is sync source only), batch quality recalculations every 15-30 minutes.

2. **Supabase Realtime Quota Explosion** — Real-time lane migrations generate continuous messages. At moderate usage (100 users, migrations every 15 min), can hit 5.7M messages/month—1000%+ over free tier. Solution: Batch updates (send "lanes updated" not individual job messages), implement local-first UI for high-frequency updates, limit real-time to critical features only.

3. **Click-Based Quality Signal Gaming** — Click farming and automation easily manipulate engagement scores. Solutions: Combine clicks with validation signals (time-on-page, scroll depth, return visits), implement velocity limits (max 50 interactions/hour), weight signals by user trust score, require OAuth to raise gaming cost, add honeypot jobs to detect bots.

4. **Aggregator Lag Creates Ghost Jobs** — JSearch aggregates from aggregators (Indeed, Glassdoor), creating 3-5 day staleness. Jobs appear "Open" but were filled days ago. Solutions: Display job age prominently ("Posted 5 days ago"), implement job validation after clicks, de-prioritize old jobs in scoring, archive jobs >14 days automatically, add "Is this job still available?" user feedback.

5. **Privacy Law Violations** — Engagement tracking requires explicit consent under 2026 laws (8 US states require GPC signals). Solutions: Implement consent banner BEFORE any tracking, honor GPC signals (disable tracking if opted out), document tracking in privacy policy explicitly, provide data deletion in settings, test with DevTools to verify blocking.

6. **Gamification Creates Perverse Incentives** — Research shows 80% of gamification projects fail. Job hunting with leaderboards/streaks adds stress, encourages quantity over quality. Solutions: Skip leaderboards entirely, focus on progress tracking not competition, provide opt-out from game features, test with service workers before building, consider skipping gamification entirely.

## Implications for Roadmap

Based on research, suggested phase structure prioritizes validation over features, establishes foundations before automation, and addresses critical pitfalls early.

### Phase 1: Foundation & Validation (Weeks 1-2)
**Rationale:** Establish data infrastructure, authentication, and API integration before building UI. Address API quota and privacy pitfalls from day one to avoid rework.

**Delivers:**
- Supabase schema with RLS policies
- Auth flow (email/password + Google OAuth)
- JSearch API integration with caching (24h TTL)
- Job sync Server Action with deduplication
- Consent management (privacy compliance)
- Basic job listing display (no Kanban yet)

**Addresses (from FEATURES.md):**
- Basic Auth (table stakes)
- External Quick Apply (table stakes)
- Job Listing Cards (table stakes)
- Mobile-responsive design foundation

**Avoids (from PITFALLS.md):**
- API Rate Limit Exhaustion (caching strategy from start)
- Privacy Law Violations (consent before tracking)
- Missing RLS policies (security requirement)

**Research flag:** Standard patterns, skip `/gsd:research-phase` (well-documented Supabase + Next.js setup)

### Phase 2: Engagement System (Weeks 2-3)
**Rationale:** Build click tracking with anti-gaming measures before visual features. Engagement data must be trustworthy for lane migrations to work.

**Delivers:**
- Click tracking Server Action with validation
- Signal validation (time-on-page, scroll depth)
- Velocity limits (max 50 interactions/hour)
- User trust scoring system
- Honeypot jobs for bot detection
- Engagement analytics dashboard (admin)

**Addresses (from FEATURES.md):**
- Click Analytics (table stakes for gamification)
- Engagement tracking infrastructure

**Avoids (from PITFALLS.md):**
- Click-Based Quality Signal Gaming (validation + limits from start)
- Client-side timestamp manipulation (server-side validation)
- No rate limiting on actions (50/hour cap)

**Uses (from STACK.md):**
- Zod for server action validation
- Supabase RPC for atomic click increments
- @tanstack/react-query for optimistic updates

**Research flag:** Needs `/gsd:research-phase` for anti-gaming patterns (novel domain, sparse documentation on click validation)

### Phase 3: Kanban Visualization (Weeks 3-4)
**Rationale:** With engagement data flowing reliably, build visual layer. Static lanes first (manual categorization) to demonstrate concept before automation.

**Delivers:**
- Kanban board layout (three lanes: New, Trending, Graduated)
- Job card components with drag-and-drop
- Manual lane assignment (admin tool)
- Job details modal
- Search & filter (location, job type, pay range)
- Saved jobs feature

**Addresses (from FEATURES.md):**
- Kanban Visual Format (core differentiator)
- Search & Filters (table stakes at scale)
- Saved Jobs (retention feature)
- Job Details View (table stakes)

**Avoids (from PITFALLS.md):**
- Complex drag state before engagement works
- Building automation before validating concept

**Uses (from STACK.md):**
- @hello-pangea/dnd for drag interactions
- Framer Motion for layout animations
- Tailwind CSS for responsive grid

**Implements (from ARCHITECTURE.md):**
- Kanban UI Components
- Drag-and-drop with database persistence
- Optimistic UI for card movements

**Research flag:** Standard patterns, skip `/gsd:research-phase` (Kanban + dnd-kit well-documented)

### Phase 4: Automated Lane Migration (Week 4-5)
**Rationale:** With validated engagement data and working Kanban UI, automate lane transitions. This is the core value proposition—needs careful threshold tuning.

**Delivers:**
- Engagement Engine (threshold-based migrations)
- Automatic New → Trending → Graduated flow
- Real-time lane updates via Supabase Realtime
- Click heatmaps on cards (visual intensity)
- Job age weighting in quality scoring
- Graduated archive with search

**Addresses (from FEATURES.md):**
- Automatic Lane Migration (CORE DIFFERENTIATOR)
- Trending Section (competitive advantage)
- Graduated Archive (historical validation)
- Click Heatmaps (discovery enhancement)

**Avoids (from PITFALLS.md):**
- Supabase Realtime Quota Explosion (batched updates, table-level subscriptions)
- Aggregator Lag (job age weighting, auto-archive >14 days)
- Lane migration race conditions (server-side threshold checks)

**Uses (from STACK.md):**
- Supabase Realtime with filtered subscriptions
- @supabase-cache-helpers for query invalidation
- Server Actions for migration logic

**Implements (from ARCHITECTURE.md):**
- Engagement Engine
- Realtime subscription with optimistic updates
- Lane migration state machine

**Research flag:** Needs `/gsd:research-phase` for threshold tuning (no precedent for click-to-quality thresholds in job context)

### Phase 5: Polish & Launch Prep (Week 5-6)
**Rationale:** With core features working, add delight and production hardening. Animation performance, error handling, monitoring.

**Delivers:**
- Playful animations (lane transitions, card movements)
- Celebration moments (confetti for milestones)
- Email notifications (weekly trending digest)
- Error handling and loading states
- Job age display ("Posted X days ago")
- User feedback ("Is this job still available?")
- Performance optimization (LazyMotion, virtualization)

**Addresses (from FEATURES.md):**
- Playful Animations (differentiator)
- Email Notifications (retention)
- Production readiness

**Avoids (from PITFALLS.md):**
- Animation performance issues (GPU-accelerated only)
- Ghost jobs without user warning (age display, feedback)
- Poor error UX (graceful degradation)

**Uses (from STACK.md):**
- Framer Motion LazyMotion for code-splitting
- date-fns for "X minutes ago" timestamps
- Vercel Cron for email scheduling

**Research flag:** Standard patterns, skip `/gsd:research-phase` (animation optimization well-documented)

### Phase Ordering Rationale

**Dependencies drive order:**
- Phase 1 must come first (database schema required for all features)
- Phase 2 before Phase 3 (engagement data must be reliable before visualization)
- Phase 3 before Phase 4 (manual lanes validate UX before automation)
- Phase 4 is the "unlock" (core differentiator, validates entire hypothesis)
- Phase 5 comes last (polish after validation)

**Pitfall mitigation shapes grouping:**
- Caching + consent in Phase 1 prevents API/privacy issues
- Anti-gaming in Phase 2 prevents data quality issues
- Batched updates in Phase 4 prevent quota explosion
- User validation in Phase 5 addresses ghost jobs

**Architecture patterns inform structure:**
- Server Actions + Supabase setup (Phase 1) enables all mutations
- Realtime subscriptions (Phase 4) require stable engagement data
- Optimistic UI (Phase 3-4) needs Server Actions to be proven

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (Engagement System):** Anti-gaming patterns for click-based quality signals—sparse documentation, needs custom solution research
- **Phase 4 (Lane Migration):** Threshold tuning for engagement-to-quality conversion—no precedent in job boards, needs experimentation framework

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Supabase + Next.js setup is well-documented with official guides
- **Phase 3 (Kanban):** Drag-and-drop Kanban patterns extensively documented in tutorials and blog posts
- **Phase 5 (Polish):** Framer Motion performance optimization has clear best practices

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies verified from official docs (Next.js 16 release notes, Supabase docs, npm versions). Version compatibility cross-referenced. |
| Features | MEDIUM | Table stakes well-established from job board research. Core differentiator (community curation) is novel hypothesis requiring validation. |
| Architecture | HIGH | Realtime patterns verified from Supabase best practices. Server Actions and drag-and-drop patterns have multiple verified examples. |
| Pitfalls | MEDIUM | API/Realtime quota issues verified from recent case studies (2026 sources). Anti-gaming and privacy compliance based on industry trends but lack job board specifics. |

**Overall confidence:** HIGH for technical implementation, MEDIUM for product-market fit

The stack is proven and well-documented. Architecture patterns are established for real-time Kanban applications. Technical execution risk is low—we know HOW to build this.

The uncertainty is in product validation: Will service industry workers engage with gamified discovery? Are click-based quality signals reliable? The roadmap addresses this by prioritizing validation (Phase 4 automated migration is the test) before polish (Phase 5).

### Gaps to Address

**Product validation (highest priority):**
- Engagement threshold tuning lacks precedent—what click count defines "Trending"? Needs A/B testing framework in Phase 4, user research with service workers before launch.
- Click signal reliability unknown—will users game it despite anti-gaming measures? Needs monitoring dashboard and manual review process in Phase 2.

**Technical scaling (medium priority):**
- JSearch API long-term viability unclear—500 requests/month requires tight caching, but paid tier costs unknown. Needs cost projection and alternative API research (backup sources).
- Supabase Realtime message limits require careful monitoring—free tier quotas poorly documented for broadcast use case. Needs quota dashboard and alerting in Phase 4.

**Privacy compliance (address in Phase 1):**
- GPC signal handling not yet tested—8 states require it, but implementation specifics vary. Needs legal review of consent platform choice and testing with GPC browser extensions.
- Cross-border data handling unclear—if service workers in EU/CA use platform, GDPR/PIPEDA apply. Needs data residency decision (Supabase region selection).

**How to handle during planning/execution:**
- **Validation gaps:** Build measurement framework in Phase 2 (track click patterns, user surveys), run closed beta with 20-50 service workers before public launch, iterate thresholds based on data
- **Technical gaps:** Set hard usage caps (max users based on quota math), monitor dashboards daily during beta, maintain API/quota budget spreadsheet, identify paid tier trigger points
- **Compliance gaps:** Legal review before Phase 1 completion, test consent blocking with DevTools, implement data deletion API, document all tracking in privacy policy explicitly

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release](https://nextjs.org/blog/next-16) — Framework features and React 19 integration
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1) — Latest stable version
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) — Version 2.90.1 confirmation
- [Supabase Realtime Architecture](https://supabase.com/docs/guides/realtime) — WebSocket patterns and limits
- [Supabase + Next.js Auth Guide](https://supabase.com/docs/guides/auth/server-side/nextjs) — SSR authentication with App Router
- [Framer Motion npm](https://www.npmjs.com/package/framer-motion) — React 19 support verification
- [Tailwind CSS Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) — Official integration setup

### Secondary (MEDIUM confidence)
- [Supabase Best Practices 2026](https://www.leanware.co/insights/supabase-best-practices) — Realtime filtering, cleanup patterns
- [Top 5 Drag-and-Drop Libraries for React](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) — @hello-pangea/dnd recommendation
- [Building a Kanban Board with Shadcn](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html) — Drag-and-drop architecture patterns
- [Next.js Supabase Quota Overrun Case Study](https://dev.to/yitao/nextjs-15-supabase-i-accidentally-blew-past-my-quota-by-1000-and-how-local-first-saved-it-1leh) — Real-world quota explosion example
- [Why Gamification Fails: 2026 Findings](https://medium.com/design-bootcamp/why-gamification-fails-new-findings-for-2026-fff0d186722f) — 80% failure rate research
- [Website Tracking Lawsuits Surge 2026](https://www.shumaker.com/insight/client-alert-website-tracking-and-privacy-lawsuits-predicted-to-surge-in-2026-practical-steps-to-mitigate-risk/) — Privacy compliance trends
- [Best Job Board Aggregators Guide](https://www.chiefjobs.com/the-best-job-board-aggregators-in-the-us-a-comprehensive-guide/) — Feature comparison (Indeed, ZipRecruiter, Snagajob)
- [JSearch API Documentation](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) — Rate limits and capabilities

### Tertiary (needs validation)
- [Job Aggregator Lag Issues](https://www.whatjobs.com/news/joblookup-review-2026-legit-job-board-or-low-traffic-aggregator/) — Ghost job problem documentation
- [Scalable Signal Integration for Job Matching](https://arxiv.org/html/2507.09797v1) — Academic research on behavioral signals (needs practical translation)
- Community posts on Product Hunt mechanics — Upvote-to-ranking patterns (informal, not peer-reviewed)

---
*Research completed: 2026-02-02*
*Ready for roadmap: yes*
