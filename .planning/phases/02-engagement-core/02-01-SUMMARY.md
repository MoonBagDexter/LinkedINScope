---
phase: 02-engagement-core
plan: 01
subsystem: engagement-tracking
tags: [supabase, click-tracking, anti-gaming, toast-notifications]
requires: [01-foundation-auth]
provides:
  - click-tracking-service
  - user-click-history
  - lane-migration-logic
  - already-applied-badges
affects: [02-02-kanban-ui]
tech-stack:
  added:
    - "@supabase/supabase-js": "Supabase client for database operations"
    - "sonner": "Toast notifications for click feedback"
  patterns:
    - "Anti-gaming enforcement via database unique constraints"
    - "Optimistic updates with React Query invalidation"
    - "Threshold-based lane migration (5→trending, 20→graduated)"
key-files:
  created:
    - src/services/supabase.ts
    - src/services/clickTracker.ts
    - src/types/kanban.ts
    - src/hooks/useClickTracking.ts
    - src/hooks/useUserClicks.ts
  modified:
    - src/components/JobCard.tsx
    - src/vite-env.d.ts
    - .env.example
decisions:
  - id: threshold-values
    choice: "5 clicks for trending, 20 for graduated"
    rationale: "Balanced thresholds for quick initial movement while requiring significant engagement for top tier"
  - id: anti-gaming-strategy
    choice: "Database unique constraint on (wallet_address, job_id)"
    rationale: "Database-enforced deduplication prevents any client-side gaming attempts"
  - id: click-timing
    choice: "Record click when Quick Apply button is clicked"
    rationale: "Captures genuine engagement - user clicked to visit external job page"
  - id: toast-library
    choice: "Sonner for toast notifications"
    rationale: "Modern, lightweight, and works well with React Query patterns"
metrics:
  duration: 5min
  completed: 2026-02-02
---

# Phase 02 Plan 01: Click Tracking Foundation Summary

**One-liner:** Supabase-based click tracking with unique constraint anti-gaming and configurable threshold lane migration (5→trending, 20→graduated)

## What Was Built

Implemented the core engagement tracking system that powers the platform's differentiator - jobs rising based on real community clicks, not algorithms.

**Architecture:**
```
JobCard (UI)
  ↓ hasClicked prop
useUserClicks (Query)
  ↓ fetch clicked jobs
clickTracker service
  ↓ database operations
Supabase (clicks + jobs tables)
  - unique constraint: (wallet_address, job_id)
  - lane migration thresholds
```

**Key Components:**

1. **Supabase Client** (`src/services/supabase.ts`)
   - Singleton client with environment variable validation
   - Centralized database access for all engagement features

2. **Click Tracker Service** (`src/services/clickTracker.ts`)
   - `recordClick()`: Insert click, increment count, check thresholds, migrate lanes
   - `getUserClickedJobs()`: Fetch all job IDs user has clicked
   - `hasUserClicked()`: Check if specific job was clicked
   - Anti-gaming: Unique constraint on `(wallet_address, job_id)` prevents duplicates
   - Lane migration: Auto-promotes jobs at 5 clicks (trending) and 20 clicks (graduated)

3. **React Query Hooks**
   - `useClickTracking`: Mutation hook with toast notifications for migrations
   - `useUserClicks`: Query hook for user's click history (5min stale time)
   - Automatic query invalidation after clicks for real-time UI updates

4. **JobCard Enhancements**
   - "Already applied" badge (green checkmark) for clicked jobs
   - Green border styling for clicked state vs purple for unclicked
   - Props: `walletAddress`, `hasClicked`, `onMigration` for parent integration

## How It Works

**Click Flow:**
1. User clicks "Quick Apply" on JobCard
2. Parent component calls `useClickTracking.trackClick()`
3. Service attempts to insert click record
4. Database enforces unique constraint - fails silently if duplicate
5. If new click: increment `click_count`, check thresholds
6. If threshold crossed: update lane, return migration info
7. Hook shows toast notification (success or "already clicked")
8. Queries invalidated → UI updates with new badge/count

**Lane Migration Logic:**
- Jobs start in `new` lane (0-4 clicks)
- At 5 clicks: migrate to `trending`
- At 20 clicks: migrate to `graduated`
- Thresholds configurable via environment variables

## Verification Results

All verification criteria met:

- ✅ `npm run build` passes with no TypeScript errors
- ✅ Supabase client singleton created and exported
- ✅ Lane types (new, trending, graduated) defined in `src/types/kanban.ts`
- ✅ Click tracking service with anti-gaming logic implemented
- ✅ `useClickTracking` hook uses mutation with query invalidation
- ✅ `useUserClicks` hook fetches user's clicked job IDs
- ✅ JobCard displays "Already applied" badge when `hasClicked=true`
- ✅ Environment variables documented in `.env.example`

## Decisions Made

### 1. Threshold Values (5→trending, 20→graduated)
- **Context:** Need balanced progression for kanban lanes
- **Decision:** 5 clicks for trending, 20 for graduated
- **Rationale:** Low threshold (5) creates quick movement and early engagement feedback. Higher threshold (20) ensures only genuinely popular jobs reach top tier
- **Configurable:** Via `VITE_THRESHOLD_NEW_TO_TRENDING` and `VITE_THRESHOLD_TRENDING_TO_GRADUATED`

### 2. Anti-Gaming Strategy
- **Context:** Prevent users from inflating click counts
- **Decision:** Database unique constraint on `(wallet_address, job_id)`
- **Rationale:** Database-level enforcement is tamper-proof. Client-side checks can be bypassed
- **Implementation:** PostgreSQL `UNIQUE` constraint returns error code `23505` on duplicates

### 3. Click Recording Timing
- **Context:** When to count a click
- **Decision:** Record when Quick Apply button is clicked
- **Rationale:** Captures genuine engagement - user clicked to visit external job page, not just viewed the card
- **UX:** Button still works for revisiting, but click count doesn't increment

### 4. Toast Notification Library
- **Context:** Need user feedback for click actions and migrations
- **Decision:** Sonner library
- **Rationale:** Modern, lightweight, zero-config, works well with React Query mutation patterns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed unused currency variable in JobCard**
- **Found during:** Task 1 build verification
- **Issue:** TypeScript error - `currency` variable declared but never used in formatSalary()
- **Fix:** Removed unused variable declaration
- **Files modified:** `src/components/JobCard.tsx`
- **Commit:** 8de2785

## Files Changed

### Created (5 files)
- `src/services/supabase.ts` - Supabase client singleton
- `src/services/clickTracker.ts` - Click tracking database operations
- `src/types/kanban.ts` - Lane types and database interfaces
- `src/hooks/useClickTracking.ts` - Click tracking mutation hook
- `src/hooks/useUserClicks.ts` - User click history query hook

### Modified (3 files)
- `src/components/JobCard.tsx` - Added already applied badge and props
- `src/vite-env.d.ts` - Added Supabase and threshold env var types
- `.env.example` - Added Supabase config and threshold defaults

### Dependencies Added
- `@supabase/supabase-js@^2.x` - Supabase JavaScript client
- `sonner@^1.x` - Toast notifications

## Integration Notes

**For Next Plan (02-02 Kanban UI):**

This plan provides the data layer. Next plan needs to:

1. **Run Supabase Setup** (user_setup section in PLAN.md)
   - Create `jobs` table with lane column
   - Create `clicks` table with unique constraint
   - Set up RLS policies
   - Enable realtime for jobs table

2. **Integrate hooks in KanbanBoard component:**
   ```tsx
   const { clickedJobIds } = useUserClicks(walletAddress);
   const { trackClick } = useClickTracking();

   // Pass to JobCard
   <JobCard
     hasClicked={clickedJobIds.has(job.job_id)}
     onApplyClick={(jobId, link) => {
       if (walletAddress) {
         trackClick({ jobId, walletAddress, jobTitle: job.job_title });
       }
       window.open(link, '_blank');
     }}
   />
   ```

3. **Subscribe to lane migrations** for real-time updates

## Next Phase Readiness

**Ready for Phase 2 continuation:** Yes

**Prerequisites for 02-02:**
- ✅ Click tracking service implemented
- ✅ User click history queries ready
- ✅ JobCard supports already applied badges
- ⚠️ **User must complete Supabase setup** (tables, RLS, realtime)

**Blockers:** None

**Concerns:**
- Supabase free tier has row limits (500K rows). With unique constraint per wallet+job, this is unlikely to be hit in early testing, but should monitor in production
- Realtime subscriptions have message limits (addressed in Phase 3 plan)

## Performance Notes

**Execution time:** 5 minutes

**Build size impact:**
- Bundle increased by ~570KB (Supabase client)
- Minimal runtime impact - database queries cached by React Query

**Database queries:**
- Click recording: 3 queries (check job exists, insert click, update count)
- User clicks fetch: 1 query per wallet (cached 5min)
- No N+1 issues - all queries are simple indexed lookups

## Testing Recommendations

**Manual testing after Supabase setup:**
1. Connect wallet
2. Click Quick Apply on a job
3. Verify toast appears
4. Refresh page - badge should persist
5. Click same job again - should see "already clicked" toast
6. Click same job 5 times (different wallets) - should migrate to trending with toast
7. Continue to 20 clicks - should graduate with toast

**Database verification:**
```sql
-- Check click deduplication
SELECT wallet_address, job_id, COUNT(*)
FROM clicks
GROUP BY wallet_address, job_id
HAVING COUNT(*) > 1; -- Should return no rows

-- Verify lane migrations
SELECT lane, COUNT(*) FROM jobs GROUP BY lane;
```

## Links

- **Phase plan:** `.planning/phases/02-engagement-core/02-01-PLAN.md`
- **Phase context:** `.planning/phases/02-engagement-core/02-CONTEXT.md`
- **Phase research:** `.planning/phases/02-engagement-core/02-RESEARCH.md`
- **Supabase docs:** https://supabase.com/docs/reference/javascript/insert
- **Sonner docs:** https://sonner.emilkowal.ski/

---

**Status:** ✅ Complete
**Next:** 02-02 Kanban UI Integration
