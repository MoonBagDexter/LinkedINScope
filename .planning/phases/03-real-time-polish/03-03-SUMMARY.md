---
phase: 03-real-time-polish
plan: 03
subsystem: realtime, ui
tags: [supabase, realtime, broadcast, presence, simulation, animation]

# Dependency graph
requires:
  - phase: 03-01
    provides: useRealtimeSync hook, usePresence hook, throttled Supabase client
  - phase: 03-02
    provides: slide animations, progress bar emphasis, degen toasts
provides:
  - Real-time click broadcast on all clicks
  - Live user count synced across tabs
  - Offline/reconnect handling with cache invalidation
  - Activity simulator for 24/7 demo activity
  - Complete real-time loop (click -> broadcast -> animate)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Broadcast on every click (not just migrations) for real-time updates"
    - "Activity simulator with lane limits (Trending < 5, Graduated < 3)"
    - "Temporary fake degens (10-30s) for organic activity feel"
    - "Direct cache update via queryClient.setQueryData for instant UI"

key-files:
  created:
    - src/services/activitySimulator.ts
  modified:
    - src/hooks/useClickTracking.ts
    - src/hooks/useRealtimeSync.ts
    - src/components/KanbanBoard.tsx
    - src/App.tsx
    - src/main.tsx

key-decisions:
  - "Broadcast all clicks (not just migrations) for live click count sync"
  - "Toast position: top-center with 2s duration"
  - "Simulator intervals: 45-90 seconds (randomized)"
  - "Lane limits: Trending < 5, Graduated < 3 before simulator acts"
  - "Fake degens: temporary (10-30s) not permanent"

patterns-established:
  - "Activity simulation with lane-based guards"
  - "Direct queryClient.setQueryData for broadcast-triggered updates"

# Metrics
duration: 35min
completed: 2026-02-03
---

# Phase 3 Plan 3: Real-Time Wiring Summary

**Real-time click broadcast across all users, live degen count in header, and 24/7 activity simulator for organic demo traffic**

## Performance

- **Duration:** 35 min
- **Started:** 2026-02-03T03:40:20Z
- **Completed:** 2026-02-03T04:15:00Z
- **Tasks:** 2 (1 auto + 1 checkpoint)
- **Files modified:** 6

## Accomplishments

- Complete real-time loop: clicks broadcast immediately to all users
- Live click count updates in UI (no page refresh needed)
- Activity simulator runs 24/7 with lane-based limits and temporary fake degens
- Offline/reconnect handling invalidates cache on network restore
- Toast messages positioned top-center with 2s duration

## Task Commits

Each task was committed atomically:

1. **Task 1: Broadcast migration events and wire KanbanBoard** - `ec314f0` (feat)
2. **Fix: Live click count updates and toast position** - `c8b4154` (fix)
3. **Feature: Add activity simulator for demo/testing** - `1eb22ed` (feat)
4. **Fix: Remove duplicate Toaster from main.tsx** - `08f287b` (fix)
5. **Feature: Auto-running simulator with lane limits** - `eff1014` (feat)
6. **Fix: Temporary fake degens instead of permanent** - `a0453f1` (fix)
7. **Fix: Simulator broadcasts live updates properly** - `2e6d371` (fix)
8. **Fix: Slow down simulator to 45-90 second intervals** - `527c452` (fix)

## Files Created/Modified

- `src/hooks/useClickTracking.ts` - Broadcasts all clicks for live updates, updates cache directly
- `src/hooks/useRealtimeSync.ts` - Listens for job-clicked and job-migrated events
- `src/components/KanbanBoard.tsx` - Wired useRealtimeSync hook, added online event listener
- `src/App.tsx` - Toaster config (top-center, 2s), imports and runs activity simulator
- `src/main.tsx` - Removed duplicate Toaster component
- `src/services/activitySimulator.ts` - 24/7 background activity with lane limits and temporary fake degens

## Decisions Made

1. **Broadcast all clicks, not just migrations** - Enables live click count updates across all users without requiring lane change
2. **Toast position: top-center** - Better visibility than top-right, shorter 2s duration for faster feedback
3. **Simulator interval: 45-90 seconds** - Slow enough to feel organic, fast enough to demo features
4. **Lane limits for simulator** - Trending < 5 and Graduated < 3 prevents lane overflow during demo
5. **Temporary fake degens (10-30s)** - Creates organic feel without inflating permanent user counts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Live click count not updating in other tabs**
- **Found during:** Checkpoint verification
- **Issue:** Only migration events were broadcast, regular clicks didn't sync
- **Fix:** Broadcast all clicks (not just migrations), listen for job-clicked event in useRealtimeSync
- **Files modified:** src/hooks/useClickTracking.ts, src/hooks/useRealtimeSync.ts
- **Committed in:** c8b4154

**2. [Rule 1 - Bug] Duplicate Toaster components**
- **Found during:** Toast testing
- **Issue:** Toaster in both App.tsx and main.tsx caused duplicate toasts
- **Fix:** Removed Toaster from main.tsx
- **Files modified:** src/main.tsx
- **Committed in:** 08f287b

**3. [Rule 2 - Missing Critical] No demo activity for testing**
- **Found during:** Real-time verification
- **Issue:** Need activity to demonstrate real-time features without multiple users
- **Fix:** Created activitySimulator.ts with automatic click generation
- **Files modified:** src/services/activitySimulator.ts, src/App.tsx
- **Committed in:** 1eb22ed, eff1014

**4. [Rule 1 - Bug] Simulator not broadcasting updates**
- **Found during:** Simulator testing
- **Issue:** Simulator clicks weren't triggering real-time updates in other tabs
- **Fix:** Added broadcast calls to simulator click function
- **Files modified:** src/services/activitySimulator.ts
- **Committed in:** 2e6d371

**5. [Rule 1 - Bug] Fake degens persisting permanently**
- **Found during:** Presence testing
- **Issue:** Simulator-created presence entries never cleaned up
- **Fix:** Made fake degens temporary (10-30s) with automatic cleanup
- **Files modified:** src/services/activitySimulator.ts
- **Committed in:** a0453f1

**6. [Rule 1 - Bug] Simulator too fast for organic feel**
- **Found during:** Demo testing
- **Issue:** Clicks every 5-15 seconds felt spammy, not organic
- **Fix:** Slowed to 45-90 second intervals
- **Files modified:** src/services/activitySimulator.ts
- **Committed in:** 527c452

---

**Total deviations:** 6 auto-fixed (4 bugs, 2 missing critical)
**Impact on plan:** All fixes necessary for correct real-time behavior and demo capability. Activity simulator was essential addition for testing without multiple real users.

## Issues Encountered

None - all issues were auto-fixed during checkpoint verification.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Phase 3 Complete!**

All real-time features delivered:
- Live user count display ("X degens online")
- Real-time click count updates across all users
- Lane migration animations (250ms slide)
- Near-threshold emphasis (pulse + warm colors at 80%)
- Degen-style toast messages
- Offline/reconnect handling
- 24/7 activity simulator for demos

**V1 MVP Ready:**
- Wallet authentication with Phantom
- Job display from cached Supabase data
- Click tracking with anti-gaming
- Three-lane Kanban board (New -> Trending -> Graduated)
- Real-time updates across all connected users
- Mobile-responsive design

---
*Phase: 03-real-time-polish*
*Completed: 2026-02-03*
