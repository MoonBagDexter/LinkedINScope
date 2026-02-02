---
phase: 02-engagement-core
plan: 02
subsystem: ui-frontend
type: execution
completed: 2026-02-02
duration: "18min"
tags: ["kanban", "ui", "responsive", "react", "toast-notifications"]

requires:
  - phase: 02
    plan: 01
    what: "Click tracking hooks and lane migration logic"
    why: "Kanban board displays lanes based on click thresholds"

provides:
  - capability: "Three-lane Kanban board with responsive layout"
    components: ["KanbanBoard", "KanbanLane", "ProgressBar", "MobileTabNav"]
    integration: "Replaces JobList as primary UI"
  - capability: "Visual click progress tracking per job"
    components: ["ProgressBar"]
    ux: "Shows engagement without revealing exact thresholds"
  - capability: "Mobile-optimized tabbed navigation"
    components: ["MobileTabNav"]
    ux: "Swipe-like tabs for lane switching on small screens"

affects:
  - phase: 02
    plan: 03
    what: "Real-time lane updates"
    how: "Will enhance with Supabase subscriptions for instant migrations"
  - phase: 03
    plan: "*"
    what: "Job ranking within lanes"
    how: "V1 can add sorting by click velocity or recency"

tech-stack:
  added:
    - name: "sonner"
      version: "^1.0.0"
      purpose: "Toast notifications for lane migrations"
      alternatives: "react-hot-toast"
  patterns:
    - pattern: "Responsive Kanban with CSS Grid"
      description: "Desktop: 3-column grid, Mobile: single column with tab nav"
      files: ["src/components/KanbanBoard.tsx"]
    - pattern: "Client-side lane composition"
      description: "Merges JSearch API data with Supabase lane assignments"
      files: ["src/hooks/useLaneJobs.ts"]
    - pattern: "Toast notification on mutation success"
      description: "Shows lane migration toast when click crosses threshold"
      files: ["src/hooks/useClickTracking.ts"]

key-files:
  created:
    - path: "src/components/KanbanBoard.tsx"
      lines: 115
      exports: ["KanbanBoard"]
      purpose: "Main Kanban orchestrator with 3-column desktop / tabbed mobile layout"
    - path: "src/components/KanbanLane.tsx"
      lines: 57
      exports: ["KanbanLane"]
      purpose: "Renders single lane with jobs and progress bars"
    - path: "src/components/ProgressBar.tsx"
      lines: 56
      exports: ["ProgressBar"]
      purpose: "Visual click progress indicator with gradient colors"
    - path: "src/components/MobileTabNav.tsx"
      lines: 47
      exports: ["MobileTabNav"]
      purpose: "Mobile tab navigation for lane switching"
    - path: "src/hooks/useLaneJobs.ts"
      lines: 65
      exports: ["useLaneJobs"]
      purpose: "Combines JSearch API data with Supabase lane assignments"
  modified:
    - path: "src/App.tsx"
      changes: "Replaced JobList with KanbanBoard as primary UI"
      impact: "Main app now displays Kanban board instead of flat list"
    - path: "src/main.tsx"
      changes: "Added Toaster component for notifications"
      impact: "Toast notifications enabled app-wide"

decisions:
  - id: "02-02-client-side-composition"
    what: "Compose lanes client-side by merging API + DB data"
    why: "Avoids duplicating job content in Supabase, reduces storage"
    alternatives: "Store full job data in Supabase with lane column"
    tradeoffs: "Slightly more complex client logic, but better API quota management"
  - id: "02-02-hidden-thresholds"
    what: "Show click counts but hide exact thresholds"
    why: "Creates mystery and anticipation per CONTEXT.md"
    implementation: "ProgressBar shows 'X clicks' without denominator"
  - id: "02-02-mobile-tabs"
    what: "Tab navigation for mobile (not swipe gestures)"
    why: "Simpler to implement, accessible, works on all devices"
    alternatives: "Swipeable carousel"
    tradeoffs: "Tabs require tap, but more predictable than swipe detection"

commits:
  - hash: "f5fe5d3"
    type: "feat"
    message: "create Kanban components (Board, Lane, ProgressBar, MobileTabNav)"
    files: 5
    additions: 340
    deletions: 0
  - hash: "e22b712"
    type: "feat"
    message: "integrate KanbanBoard into App with toast notifications"
    files: 2
    additions: 4
    deletions: 2
---

# Phase 2 Plan 2: Kanban Board UI Summary

Three-lane Kanban board with responsive desktop/mobile layouts, visual click progress tracking, and toast notifications for lane migrations.

## What Was Built

### Core Deliverables

**1. Kanban Layout System**
- Desktop: 3-column CSS Grid layout (New Listings | Trending | Graduated)
- Mobile: Tabbed navigation with single visible lane
- Responsive breakpoint at 768px
- Equal-width columns with vertical scrolling

**2. Lane Components**
- `KanbanBoard`: Main orchestrator managing layout, click tracking, and toast notifications
- `KanbanLane`: Individual lane rendering with header, jobs list, and progress bars
- `MobileTabNav`: Tab switcher for mobile with active state highlighting
- Each lane fetches and displays jobs assigned to that engagement level

**3. Progress Visualization**
- `ProgressBar`: Gradient-colored progress bars (blue-purple for new, purple-pink for trending)
- Displays current click count without revealing exact thresholds
- Percentage-based visual feedback
- Graduated lane: No progress bar, "Graduated" badge instead

**4. Data Integration Hook**
- `useLaneJobs`: Merges JSearch API data with Supabase lane assignments
- Client-side composition avoids storing duplicate job content in database
- Maps jobs to lanes based on click thresholds (5→trending, 20→graduated)
- Defaults new jobs to "New Listings" lane

**5. Toast Notification System**
- Sonner library integration in main.tsx
- Toast appears when job crosses threshold and migrates lanes
- Success toast: "Job moved to [Lane]!" with community engagement description
- Dark theme matching degen aesthetic

### UI/UX Features

**Desktop Experience:**
- Three columns visible simultaneously
- Side-by-side comparison of lanes
- Horizontal scroll if content exceeds viewport
- Each job card shows progress bar inline

**Mobile Experience:**
- Tab navigation: "New" | "Trending" | "Graduated"
- Active tab: purple underline, white text
- Single lane visible at a time
- Optimized for vertical scrolling

**Visual Feedback:**
- "Already Applied" badge on clicked jobs (when wallet connected)
- Progress bars show engagement momentum
- Toast notification celebrates community-driven migrations
- Gradient colors match lane urgency (blue→purple→pink progression)

### Integration Points

**App.tsx Changes:**
- Removed `<JobList />` component
- Replaced with `<KanbanBoard />` as primary UI
- Kanban board now handles all job display, organization, and click tracking

**Main.tsx Changes:**
- Added `<Toaster />` component from Sonner
- Positioned top-right with dark theme
- Enables app-wide toast notifications

**Click Tracking Flow:**
1. User clicks Quick Apply on job card
2. `useClickTracking` hook records click to Supabase
3. If threshold crossed, mutation returns `newLane`
4. Toast notification triggered
5. React Query invalidates lane data
6. Job instantly appears in new lane

## Verification Results

**User Checkpoint Approval:** Approved

**What User Verified:**
- Desktop: Three columns side-by-side layout works correctly
- Mobile: Tab navigation switches between lanes
- Progress bars display click progress
- "Already Applied" badges appear on clicked jobs
- Toast notifications show when migrations occur
- Click tracking integrates with Quick Apply button

**User Performance Feedback:**
> "Loading jobs is slow because JSearch API is called per-user. Should be moved to backend in V1."

**Interpretation:** Current architecture fetches all jobs from JSearch API on every user session. This is acceptable for Phase 2 prototype but should be optimized in V1 by:
- Caching jobs server-side (backend API)
- Serving cached jobs to all users
- Reducing per-user API calls
- Only calling JSearch API on scheduled updates (hourly/daily)

This is a V1 optimization concern, not a blocker for Phase 2 completion.

## Deviations from Plan

None - plan executed exactly as written.

All components built according to specification, no auto-fixes or architectural changes required.

## Known Issues

**Performance (noted by user, not blocking):**
- JSearch API called per-user session causes slow initial load
- Resolution: Move to backend caching in V1
- Tracked for future optimization, acceptable for prototype

**No other issues identified during verification.**

## Technical Notes

### Client-Side Lane Composition Pattern

The `useLaneJobs` hook implements a hybrid data fetching strategy:

```typescript
// Fetch all jobs from JSearch API (external)
const { jobs: apiJobs } = useJobs();

// Fetch lane assignments from Supabase (internal)
const { data: laneData } = useQuery(['job-lanes'], fetchLanes);

// Combine: assign lane to each job, default to 'new'
const jobsByLane = useMemo(() => {
  const laneMap = new Map(laneData?.map(l => [l.job_id, l]));
  return apiJobs.reduce((acc, job) => {
    const lane = laneMap.get(job.job_id)?.lane ?? 'new';
    acc[lane].push({ ...job, click_count: ... });
    return acc;
  }, { new: [], trending: [], graduated: [] });
}, [apiJobs, laneData]);
```

**Benefits:**
- Avoids duplicating job content in Supabase
- Preserves JSearch API quota (24h cache, single fetch per session)
- Supabase only stores: job_id, lane, click_count (minimal rows)
- Jobs automatically appear in "New Listings" without manual insertion

**Tradeoffs:**
- Client-side merge logic slightly more complex
- Can't query "jobs in trending lane" directly from DB
- Suitable for prototype, may need optimization if lane filtering becomes performance bottleneck

### Responsive Layout Implementation

**Desktop (≥768px):**
```css
.kanban-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
```

**Mobile (<768px):**
```jsx
const [activeLane, setActiveLane] = useState('new');
// Render MobileTabNav
// Conditionally render only active lane
{activeLane === 'new' && <KanbanLane lane="new" />}
```

**Why not CSS-only solution:** Mobile tabs require state management for active selection, so component-controlled visibility is cleaner than pure CSS.

### Toast Notification Timing

Toasts appear immediately after mutation success (not after React Query refetch). This provides instant feedback while data sync happens in background.

```typescript
onSuccess: (result) => {
  if (result.newLane) {
    toast.success(`Job moved to ${laneNames[result.newLane]}!`);
  }
  queryClient.invalidateQueries(['lane-jobs']);
}
```

## Dependencies

**Introduced:**
- `sonner` ^1.0.0 - Toast notification library (chosen over react-hot-toast for better TypeScript support and styling flexibility)

**Uses from Prior Plans:**
- `02-01`: `useClickTracking` hook for click recording and lane migration
- `02-01`: `useUserClicks` hook for fetching clicked job IDs
- `02-01`: `clickTracker` service for Supabase operations
- `01-02`: `JobCard` component for individual job rendering
- `01-02`: `useJobs` hook for JSearch API data

## Next Phase Readiness

**Phase 2 Plan 3 (Real-Time Updates):**
- Kanban board structure ready for Supabase real-time subscriptions
- Can add `supabase.channel().on('postgres_changes', ...)` to auto-refresh lanes
- Current polling via React Query works, real-time will enhance UX

**Phase 3 (V1 Refinements):**
- Backend job caching needed to address performance feedback
- Lane sorting within columns (by click velocity, recency) can be added
- Loading states can be enhanced with skeleton placeholders

**No blockers for continuing roadmap.**

## Files Modified

### Created (5 files, 340 lines)

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/KanbanBoard.tsx` | 115 | Main Kanban orchestrator with layout and click tracking |
| `src/components/KanbanLane.tsx` | 57 | Individual lane renderer with job cards |
| `src/components/ProgressBar.tsx` | 56 | Visual click progress indicator |
| `src/components/MobileTabNav.tsx` | 47 | Mobile tab navigation for lane switching |
| `src/hooks/useLaneJobs.ts` | 65 | Data hook merging API and DB lane assignments |

### Modified (2 files)

| File | Changes | Impact |
|------|---------|--------|
| `src/App.tsx` | Replaced JobList with KanbanBoard | Main UI now displays Kanban layout |
| `src/main.tsx` | Added Toaster component | Enables app-wide toast notifications |

## Testing Notes

**Manual Testing Performed:**
- Desktop layout: Three columns verified at >768px viewport
- Mobile layout: Tab navigation verified at <768px viewport
- Click tracking: Quick Apply records clicks, badges appear
- Lane migrations: Jobs move to new lanes when thresholds crossed
- Toast notifications: Success messages appear on migration
- Responsive breakpoints: Layout switches correctly at 768px

**Edge Cases Tested:**
- Disconnected wallet: Quick Apply still opens external link (click tracking skipped gracefully)
- Empty lanes: Lanes display even when no jobs assigned
- Multiple rapid clicks: Anti-gaming constraint prevents double-counting

## User Feedback Summary

**Approval:** Checkpoint verified and approved by user.

**Performance Note:** JSearch API per-user fetching causes slow load times. User suggests moving to backend caching in V1. This is a valid optimization but not blocking for Phase 2 prototype completion.

**Next Steps:** Continue to Plan 02-03 (Real-Time Updates) or move to Phase 3 depending on roadmap.

---

**Completed:** 2026-02-02
**Duration:** 18 minutes
**Commits:** 2 (f5fe5d3, e22b712)
**Lines Changed:** +344, -2
