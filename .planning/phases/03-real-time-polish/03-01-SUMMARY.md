---
phase: 03-real-time-polish
plan: 01
subsystem: real-time-infrastructure
tags: [supabase, realtime, presence, websocket, hooks]
dependency-graph:
  requires: [02.5-backend-job-caching]
  provides: [real-time-infrastructure, presence-tracking, job-update-sync]
  affects: [03-02, 03-03]
tech-stack:
  added: []
  patterns: [presence-api, broadcast-channel, query-invalidation]
key-files:
  created:
    - src/hooks/usePresence.ts
    - src/hooks/useRealtimeSync.ts
  modified:
    - src/services/supabase.ts
    - src/components/Header.tsx
decisions:
  - id: 03-01-01
    choice: eventsPerSecond 2 for conservative quota safety
    rationale: Default 10 could exhaust free tier (100 msg/sec) with concurrent users
  - id: 03-01-02
    choice: Anonymous presence tracking (no wallet in payload)
    rationale: CONTEXT.md specifies no click attribution, focus on community activity
  - id: 03-01-03
    choice: refetchType active for query invalidation
    rationale: Avoid refetching inactive queries, reduce unnecessary API calls
metrics:
  duration: 3min
  completed: 2026-02-03
---

# Phase 3 Plan 1: Real-Time Infrastructure Setup Summary

**One-liner:** Supabase realtime with eventsPerSecond throttling, Presence-based "X degens online" counter in Header, and job-updates broadcast subscription hook ready for wiring.

## What Was Built

### 1. Throttled Supabase Client Configuration
Updated `src/services/supabase.ts` to include realtime configuration with `eventsPerSecond: 2`. This reduces message throughput from the default 10 events/second, protecting against Supabase free tier quota (100 msg/sec) with multiple concurrent users.

### 2. usePresence Hook (Live User Count)
Created `src/hooks/usePresence.ts` that:
- Subscribes to a 'lobby' Supabase channel
- Tracks user presence on SUBSCRIBED status
- Counts connected users via `presenceState()` on sync events
- Returns live user count as a number
- Properly cleans up with both `untrack()` and `unsubscribe()` on unmount
- Anonymous tracking (no wallet address per CONTEXT.md requirements)

### 3. useRealtimeSync Hook (Job Update Broadcasts)
Created `src/hooks/useRealtimeSync.ts` that:
- Subscribes to 'jobs-updates' broadcast channel
- Listens for 'job-migrated' events
- Invalidates 'cached-jobs' React Query cache with `refetchType: 'active'`
- Accepts optional `onMigration` callback for toast notifications
- Properly cleans up subscription on unmount

### 4. Header Integration
Updated `src/components/Header.tsx` to:
- Import and call `usePresence()` hook
- Display live user count as "X degens online" (with singular handling for 1 degen)
- Position the count between logo and wallet area in the flex container

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| eventsPerSecond value | 2 | Conservative setting per RESEARCH.md recommendation for quota safety |
| Presence channel name | 'lobby' | Simple, intuitive name per RESEARCH.md pattern |
| Broadcast channel name | 'jobs-updates' | Descriptive name matching event scope |
| Presence payload | Anonymous (online_at only) | No wallet/user identity per CONTEXT.md requirements |
| Query invalidation | refetchType: 'active' | Only refetch currently active queries to save resources |

## Deviations from Plan

None - plan executed exactly as written.

## Technical Notes

### Key Links Verified
- `src/hooks/usePresence.ts` -> `src/services/supabase.ts` via `supabase.channel('lobby')`
- `src/hooks/useRealtimeSync.ts` -> `src/services/supabase.ts` via `supabase.channel('jobs-updates')`
- `src/components/Header.tsx` -> `src/hooks/usePresence.ts` via `usePresence()` hook call

### Cleanup Patterns
Both hooks follow proper cleanup patterns:
```typescript
// usePresence cleanup
return () => {
  channel.untrack();
  channel.unsubscribe();
};

// useRealtimeSync cleanup
return () => {
  channel.unsubscribe();
};
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 1b0725b | feat | Configure Supabase client with realtime throttling |
| aa9837f | feat | Create usePresence hook for live user count |
| 748a560 | feat | Create useRealtimeSync hook and integrate usePresence into Header |

## Next Phase Readiness

**Ready for 03-02 (Card Animations)**
- Real-time infrastructure is in place
- useRealtimeSync hook is ready to be wired for migration toast notifications
- Presence tracking provides multi-user awareness foundation

**No blockers identified.**
