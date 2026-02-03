# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Jobs surface based on real engagement, not algorithms
**Current focus:** Phase 3 in progress - Real-Time & Polish

## Current Position

Phase: 3 of 3 (Real-Time & Polish)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-03 - Completed 03-01-PLAN.md (Real-Time Infrastructure Setup)

Progress: [█████████░] 94%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 16min
- Total execution time: 113min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-auth | 2 | 37min | 18.5min |
| 02-engagement-core | 2 | 23min | 11.5min |
| 02.5-backend-job-caching | 2 | 50min | 25min |
| 03-real-time-polish | 1 | 3min | 3min |

**Recent Trend:**
- Last 5 plans: 02-02 (18min), 02.5-01 (5min), 02.5-02 (45min), 03-01 (3min)
- Trend: Plan 03-01 quick execution - straightforward hook creation and configuration

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Compressed to 3 phases per "quick" depth setting
- [Roadmap]: Phase 1 includes both auth and job display to minimize handoffs
- [Roadmap]: Combined click tracking and migration logic in Phase 2 (core differentiator)
- [01-01]: Tailwind v4 with Vite plugin approach (not PostCSS config)
- [01-01]: React Query 24h staleTime for API quota preservation
- [01-01]: autoConnect enabled for wallet session persistence
- [01-02]: Salary display only when API provides data
- [01-02]: Quick Apply as compact square button on right
- [01-02]: Node.js polyfills for Solana wallet adapter browser compatibility
- [02-01]: Threshold values: 5 clicks -> trending, 20 clicks -> graduated
- [02-01]: Anti-gaming via database unique constraint on (wallet_address, job_id)
- [02-01]: Click recorded when Quick Apply button clicked (not on view)
- [02-01]: Sonner library for toast notifications
- [02-02]: Client-side lane composition (merge JSearch API + Supabase data)
- [02-02]: Mobile tabs for lane switching (not swipe gestures)
- [02-02]: Progress bars show click counts without revealing thresholds
- [02.5-01]: Migration uses IF NOT EXISTS for idempotency (safe to run multiple times)
- [02.5-01]: Edge Function uses native fetch (not axios) for Deno compatibility
- [02.5-01]: Upsert preserves click_count and lane (not included in payload)
- [02.5-01]: Retry logic: 3 attempts, exponential backoff with 30% jitter
- [02.5-01]: Mark existing jobs inactive before sync, reactivate during upsert
- [02.5-02]: Manual Dashboard deployment over CLI (auth complexity in non-TTY)
- [02.5-02]: 5-minute staleTime for cached jobs (backend refreshes daily)
- [02.5-02]: Deprecated but kept useJobs and jsearch.ts for reference
- [02.5-02]: pg_cron daily schedule at 6 AM UTC (30 API requests/month)
- [03-01]: eventsPerSecond 2 for conservative Supabase quota safety
- [03-01]: Anonymous presence tracking (no wallet in payload)
- [03-01]: refetchType active for query invalidation (avoid refetching inactive queries)

### Roadmap Evolution

- Phase 2.5 inserted after Phase 2: Backend Job Caching (URGENT)
  - Reason: User feedback during Phase 2 execution identified slow initial load times
  - Problem: JSearch API called per-user causes poor UX and quota burn
  - Solution: Backend service fetches once/day, stores in Supabase, frontend queries cache
  - Priority: Must be completed before V1 launch

### Pending Todos

None.

### Blockers/Concerns

**API Quota Risk (Phase 1):**
- JSearch free tier = 500 requests/month
- Must implement aggressive caching (24-48 hour TTL) from day one
- Research suggests caching strategy critical to avoid quota exhaustion
- ADDRESSED: React Query configured with 24h stale, 48h gc, no refetch on focus/mount

**Supabase Row Limits (Phase 2):**
- Free tier = 500K rows max
- With unique constraint per wallet+job, unlikely to hit in early testing
- Should monitor in production as user base grows

**Performance - JSearch API Per-User Calls (Phase 2):**
- Original issue: JSearch API called per-user session caused slow initial load
- User feedback: "Loading jobs is slow"
- RESOLVED: Phase 2.5 complete - Backend caching implemented
- Status: Edge Function deployed, pg_cron scheduled, frontend refactored
- Result: Page load <2 seconds, no JSearch API calls from frontend

**Realtime Message Limits (Phase 3):**
- Supabase free tier has message quotas
- Research shows potential for 1000%+ overage with naive real-time
- Must use batched updates and table-level subscriptions
- ADDRESSED: eventsPerSecond set to 2 (vs default 10), table-level subscriptions in place

## Session Continuity

Last session: 2026-02-03
Stopped at: Completed 03-01-PLAN.md (Real-Time Infrastructure Setup)
Resume file: None

## Phase Completion Summaries

### Phase 1: Foundation & Auth - COMPLETE

Delivered:
- Vite React TypeScript project with Tailwind v4
- Phantom wallet connection with autoConnect session persistence
- JSearch API integration with 24-hour caching
- Job cards with Quick Apply functionality

Key artifacts:
- `src/contexts/WalletProvider.tsx` - Wallet auth
- `src/services/jsearch.ts` - API service layer
- `src/hooks/useJobs.ts` - React Query hook
- `src/components/JobCard.tsx` - Job display
- `src/components/JobList.tsx` - Job listing

### Phase 2: Engagement Core - COMPLETE (2/2 plans complete)

**Plan 02-01 Complete - Click Tracking Foundation:**

Delivered:
- Supabase client with environment variable validation
- Click tracking service with anti-gaming enforcement
- Lane migration logic (5->trending, 20->graduated)
- User click history hooks with React Query caching
- "Already applied" badges on JobCard

Key artifacts:
- `src/services/supabase.ts` - Supabase client singleton
- `src/services/clickTracker.ts` - Click tracking database operations
- `src/types/kanban.ts` - Lane types (new, trending, graduated)
- `src/hooks/useClickTracking.ts` - Click mutation hook with toasts
- `src/hooks/useUserClicks.ts` - User click history query

**Plan 02-02 Complete - Kanban Board UI:**

Delivered:
- Three-lane Kanban board with responsive desktop/mobile layouts
- Desktop: 3-column CSS Grid (New Listings | Trending | Graduated)
- Mobile: Tab navigation for lane switching
- Progress bars showing click progress (without revealing thresholds)
- Toast notifications on lane migrations
- Client-side lane composition hook (merges JSearch + Supabase data)

Key artifacts:
- `src/components/KanbanBoard.tsx` - Main Kanban orchestrator
- `src/components/KanbanLane.tsx` - Individual lane renderer
- `src/components/ProgressBar.tsx` - Visual progress indicator
- `src/components/MobileTabNav.tsx` - Mobile tab navigation
- `src/hooks/useLaneJobs.ts` - Lane data composition hook

Performance note: User identified JSearch API per-user calls as slow. V1 TODO: backend caching.

### Phase 2.5: Backend Job Caching - COMPLETE (2/2 plans complete)

**Plan 02.5-01 Complete - Backend Job Caching Artifacts:**

Delivered:
- Database migration with all JSearch API fields (job_title, employer_name, location, salary, logo, description)
- Caching control columns (is_active, last_seen) for stale job detection
- Edge Function code with retry logic and error handling
- Upsert pattern preserves engagement data (click_count, lane)

Key artifacts:
- `supabase/migrations/20260202_add_job_caching.sql` - Schema migration with idempotency
- `supabase/functions/job-sync/index.ts` - Deno Edge Function for daily sync

**Plan 02.5-02 Complete - Backend Job Caching Deployment:**

Delivered:
- Edge Function deployed and tested (10 jobs synced successfully)
- Frontend refactored to query Supabase cache (single query, 5-min staleTime)
- pg_cron scheduled for daily 6 AM UTC refresh (30 API requests/month)
- Page load performance improved to <2 seconds
- No JSearch API calls from frontend (quota preserved)

Key artifacts:
- `supabase/migrations/20260202_setup_job_sync_cron.sql` - pg_cron automation setup
- `src/hooks/useLaneJobs.ts` - Refactored to query Supabase directly
- `src/hooks/useJobs.ts` - Deprecated (kept for reference)
- `src/services/jsearch.ts` - Deprecated (kept for reference)

**Phase 2.5 Impact:** Major performance improvement - eliminated per-user JSearch API calls, achieved <2 sec page load target, preserved 94% of API quota for future features.

### Phase 3: Real-Time & Polish - IN PROGRESS (1/3 plans complete)

**Plan 03-01 Complete - Real-Time Infrastructure Setup:**

Delivered:
- Supabase client configured with eventsPerSecond: 2 throttling
- usePresence hook for live user count tracking via Presence API
- useRealtimeSync hook for job update broadcast subscriptions
- Header displays "X degens online" with live user count
- All hooks properly clean up subscriptions on unmount

Key artifacts:
- `src/services/supabase.ts` - Added realtime throttling config
- `src/hooks/usePresence.ts` - Presence API user counting
- `src/hooks/useRealtimeSync.ts` - Broadcast subscription hook
- `src/components/Header.tsx` - Live user count display

**Next:** 03-02 (Card Animations) - Slide animations for lane migrations
