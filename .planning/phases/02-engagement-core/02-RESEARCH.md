# Phase 2: Engagement Core - Research

**Researched:** 2026-02-02
**Domain:** React Kanban board with click tracking and automatic lane migration
**Confidence:** MEDIUM

## Summary

Phase 2 builds a three-lane Kanban board where jobs automatically migrate between lanes (New Listings → Trending → Graduated) based on click engagement. The standard approach uses React state management with TanStack Query for server data, Supabase composite unique constraints for anti-gaming click tracking, and CSS Grid for responsive layout that converts to mobile tabs.

Key technical decisions are already locked: Supabase for storage, one-click-per-wallet-per-job enforcement via database constraints, instant card migration on threshold crossing, and environment variables for threshold configuration. The focus is on implementing real-time updates efficiently and preventing race conditions during concurrent clicks.

Progress bars showing advancement toward next threshold should be built as custom TailwindCSS components rather than using heavy libraries. Notification toasts for migration events should use lightweight libraries like Sonner or React Hot Toast. Database schema must use composite unique constraints on (wallet_address, job_id) to enforce the one-click-per-job rule at the database level.

**Primary recommendation:** Use TanStack Query with optimistic updates for click tracking, Supabase realtime subscriptions for lane updates, and database-level composite unique constraints for anti-gaming enforcement.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | 5.90.20 | Server state management, caching | Industry standard for server data in React 2026, already in project |
| TailwindCSS | 4.1.18 | Styling, responsive design | Already in project, perfect for custom progress bars |
| React useState/useEffect | 19.2.0 | Local UI state, subscriptions | Built-in React hooks for client state |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Sonner | Latest (^1.x) | Toast notifications | Lightweight (5KB), TypeScript-first, shadcn/ui compatible |
| React Hot Toast | Latest | Alternative toast library | Minimalist, promise-based API, battle-tested |
| Supabase Realtime | Via @supabase/supabase-js | Database change subscriptions | Real-time lane updates across users |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sonner/React Hot Toast | Flowbite Toast | More heavyweight, but includes TailwindCSS examples out-of-box |
| Custom progress bars | Material Tailwind Progress | Faster to implement but adds dependency and vendor lock-in |
| TanStack Query | Redux Toolkit | More boilerplate, slower than Query for server state |

**Installation:**
```bash
npm install sonner
# OR
npm install react-hot-toast

# Supabase client (if not already installed)
npm install @supabase/supabase-js
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── KanbanBoard.tsx       # Main board container
│   ├── KanbanLane.tsx         # Individual lane component
│   ├── JobCard.tsx            # Enhanced with progress bar
│   ├── ProgressBar.tsx        # Custom progress component
│   └── MobileTabNav.tsx       # Mobile tab switcher
├── hooks/
│   ├── useClickTracking.ts    # Click tracking mutation
│   ├── useLaneJobs.ts         # Fetch jobs by lane
│   └── useRealtimeUpdates.ts  # Supabase subscription
├── services/
│   └── clickTracker.ts        # Click tracking API calls
└── types/
    └── kanban.ts              # Lane types, enums
```

### Pattern 1: Optimistic Click Tracking with Rollback

**What:** Immediately update UI when user clicks, send to server, rollback if fails

**When to use:** Click tracking where user expects instant feedback

**Example:**
```typescript
// Source: TanStack Query official docs (https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useTrackClick = (jobId: string, walletAddress: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('clicks')
        .insert({ job_id: jobId, wallet_address: walletAddress });

      if (error) throw error;
      return data;
    },

    // Optimistic update
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['jobs', jobId] });

      // Snapshot previous value
      const previousJob = queryClient.getQueryData(['jobs', jobId]);

      // Optimistically update job click count
      queryClient.setQueryData(['jobs', jobId], (old: any) => ({
        ...old,
        click_count: (old.click_count || 0) + 1,
        user_has_clicked: true
      }));

      return { previousJob };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousJob) {
        queryClient.setQueryData(['jobs', jobId], context.previousJob);
      }
    },

    // Refetch after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
      queryClient.invalidateQueries({ queryKey: ['lanes'] });
    }
  });
};
```

### Pattern 2: Supabase Realtime + React Query Integration

**What:** Use Supabase subscriptions to trigger React Query refetches for real-time updates

**When to use:** When you need to sync lane changes across all connected users

**Example:**
```typescript
// Source: Supabase docs + community patterns (https://github.com/orgs/supabase/discussions/5048)
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';

const useLaneJobs = (lane: 'new' | 'trending' | 'graduated') => {
  const queryClient = useQueryClient();

  // Fetch jobs for this lane
  const { data, refetch } = useQuery({
    queryKey: ['lane-jobs', lane],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('lane', lane)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Subscribe to job changes
  useEffect(() => {
    const channel = supabase
      .channel(`lane-${lane}`)
      .on(
        'postgres_changes',
        {
          event: '*',  // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'jobs',
          filter: `lane=eq.${lane}`
        },
        () => {
          // Refetch when any job in this lane changes
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [lane, refetch]);

  return data;
};
```

### Pattern 3: Responsive Kanban Layout (Desktop Columns → Mobile Tabs)

**What:** CSS Grid for desktop three-column layout, conditional rendering for mobile tabs

**When to use:** Kanban boards that need mobile-friendly single-lane view

**Example:**
```typescript
// Source: Community patterns (https://www.patterns.dev/react/react-2026/)
import { useState } from 'react';

const KanbanBoard = () => {
  const [activeMobileLane, setActiveMobileLane] = useState<'new' | 'trending' | 'graduated'>('new');

  return (
    <div>
      {/* Mobile tabs - visible only on mobile */}
      <div className="md:hidden flex gap-2 mb-4 border-b border-gray-700">
        <button
          onClick={() => setActiveMobileLane('new')}
          className={`px-4 py-2 ${activeMobileLane === 'new' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
        >
          New Listings
        </button>
        <button
          onClick={() => setActiveMobileLane('trending')}
          className={`px-4 py-2 ${activeMobileLane === 'trending' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
        >
          Trending
        </button>
        <button
          onClick={() => setActiveMobileLane('graduated')}
          className={`px-4 py-2 ${activeMobileLane === 'graduated' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
        >
          Graduated
        </button>
      </div>

      {/* Desktop: Three columns side-by-side */}
      {/* Mobile: Single column based on active tab */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${activeMobileLane !== 'new' ? 'hidden md:block' : ''}`}>
          <KanbanLane lane="new" title="New Listings" />
        </div>
        <div className={`${activeMobileLane !== 'trending' ? 'hidden md:block' : ''}`}>
          <KanbanLane lane="trending" title="Trending" />
        </div>
        <div className={`${activeMobileLane !== 'graduated' ? 'hidden md:block' : ''}`}>
          <KanbanLane lane="graduated" title="Graduated" />
        </div>
      </div>
    </div>
  );
};
```

### Pattern 4: Database-Level Anti-Gaming with Composite Unique Constraint

**What:** Prevent duplicate clicks at database level, not application level

**When to use:** Always, for data integrity when preventing user gaming

**Example:**
```sql
-- Source: Supabase documentation patterns
-- Create clicks table with composite unique constraint
CREATE TABLE clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT NOT NULL REFERENCES jobs(job_id),
  wallet_address TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Enforce one click per wallet per job at database level
  CONSTRAINT unique_wallet_job UNIQUE (wallet_address, job_id)
);

-- Create indexes for performance
CREATE INDEX idx_clicks_job_id ON clicks(job_id);
CREATE INDEX idx_clicks_wallet ON clicks(wallet_address);

-- Enable RLS for security
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own clicks
CREATE POLICY "Users can insert own clicks"
ON clicks
FOR INSERT
TO authenticated
WITH CHECK (wallet_address = auth.jwt() ->> 'sub');

-- Allow users to see all clicks (for aggregation/counts)
CREATE POLICY "Users can view all clicks"
ON clicks
FOR SELECT
TO authenticated
USING (true);
```

### Anti-Patterns to Avoid

- **Client-side only click validation:** Always enforce anti-gaming at database level with unique constraints. Client validation can be bypassed.
- **Polling for updates:** Don't poll Supabase every N seconds. Use realtime subscriptions to push changes.
- **Heavy drag-and-drop libraries:** This phase has no drag-and-drop. Don't add dnd-kit or react-beautiful-dnd unnecessarily.
- **Storing thresholds in database:** Per CONTEXT.md, thresholds are in .env. Don't over-engineer with database configuration tables.
- **Manual array mutations for lane migration:** Let React Query handle cache updates via invalidation, don't manually splice arrays.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom positioned divs with animations | Sonner or React Hot Toast | Stacking, animations, accessibility, queue management |
| Progress bars | DIV with dynamic width | Custom TailwindCSS component | Simple enough to build, but reusable pattern |
| Environment variable types | Manual type checking | TypeScript ImportMetaEnv interface | Type safety, autocomplete, prevents runtime errors |
| Click tracking race conditions | Application-level locks | Database unique constraints | Database handles concurrent inserts atomically |
| Real-time synchronization | WebSocket from scratch | Supabase Realtime | Connection management, reconnection, scaling handled |

**Key insight:** Click tracking with anti-gaming is a database problem, not an application problem. Use database constraints for atomicity and integrity. Application code should assume duplicates will be rejected and handle gracefully.

## Common Pitfalls

### Pitfall 1: Race Conditions in Optimistic Updates

**What goes wrong:** Multiple users click the same job simultaneously, optimistic UI shows different states, then corrects awkwardly after server response.

**Why it happens:** Not canceling in-flight queries before optimistic update, or not properly reverting on error.

**How to avoid:** Use TanStack Query's `onMutate` to cancel existing queries with `queryClient.cancelQueries()` before updating cache optimistically. Always return snapshot for rollback.

**Warning signs:** UI flickers between states, click counts jump unexpectedly, cards appear/disappear then reappear.

### Pitfall 2: Threshold Migration Doesn't Trigger

**What goes wrong:** Job reaches 5 clicks but stays in "New Listings" instead of moving to "Trending."

**Why it happens:** Migration logic only runs on app load, not after each click. No trigger or function to check threshold after INSERT.

**How to avoid:** Use Postgres trigger or database function that updates `lane` column immediately after click INSERT. Alternative: check threshold in mutation `onSuccess` callback and update lane via separate mutation.

**Warning signs:** Manual refresh makes cards jump lanes, lanes don't update in real-time, click count increments but lane stays same.

### Pitfall 3: Supabase Realtime Not Enabled for Table

**What goes wrong:** Subscribe to table changes, but no events fire even though data changes in database.

**Why it happens:** Realtime not enabled on table, or table not added to `supabase_realtime` publication.

**How to avoid:** Run `ALTER TABLE jobs REPLICA IDENTITY FULL;` and add to publication with `ALTER PUBLICATION supabase_realtime ADD TABLE jobs;`

**Warning signs:** Subscription connects successfully, but `postgres_changes` callback never fires. Changes only appear after manual refetch.

### Pitfall 4: Storing Environment Thresholds as Strings

**What goes wrong:** Comparing click count to threshold fails because `import.meta.env.VITE_THRESHOLD_NEW_TO_TRENDING` is string "5", not number 5.

**Why it happens:** Vite environment variables are always strings, even if they look like numbers.

**How to avoid:** Parse environment variables immediately: `const threshold = parseInt(import.meta.env.VITE_THRESHOLD_NEW_TO_TRENDING, 10);`

**Warning signs:** Migration never triggers even at exact threshold, or triggers at wrong number. `5 === "5"` is false in JavaScript.

### Pitfall 5: Progress Bar Shows Wrong Percentage After Migration

**What goes wrong:** Job moves from Trending to Graduated (20 clicks), but progress bar shows 100% toward next threshold (which doesn't exist).

**Why it happens:** Progress bar calculation doesn't handle final lane specially.

**How to avoid:** For "Graduated" lane, don't show progress bar or show "Graduated" badge instead. Progress bar only makes sense for lanes with a next threshold.

**Warning signs:** Progress bar at 100% in Graduated lane, or shows progress toward non-existent threshold.

## Code Examples

Verified patterns from official sources:

### Custom Progress Bar Component (TailwindCSS)

```typescript
// Source: TailwindCSS community patterns
interface ProgressBarProps {
  current: number;      // Current click count
  threshold: number;    // Clicks needed for next lane
  variant?: 'new' | 'trending';
}

export const ProgressBar = ({ current, threshold, variant = 'new' }: ProgressBarProps) => {
  const percentage = Math.min((current / threshold) * 100, 100);
  const colorClasses = variant === 'new'
    ? 'from-blue-500 to-purple-500'
    : 'from-purple-500 to-pink-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{current} clicks</span>
        <span>{threshold - current} to go</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`bg-gradient-to-r ${colorClasses} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

### Vite Environment Variable Types

```typescript
// Source: Vite official documentation (https://vite.dev/guide/env-and-mode)
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JSEARCH_API_KEY: string;
  readonly VITE_THRESHOLD_NEW_TO_TRENDING: string;
  readonly VITE_THRESHOLD_TRENDING_TO_GRADUATED: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Toast Notification for Lane Migration

```typescript
// Source: Sonner documentation
import { toast } from 'sonner';

// In click tracking mutation onSuccess callback
const handleMigration = (oldLane: string, newLane: string, jobTitle: string) => {
  toast.success(`"${jobTitle}" just moved to ${newLane}!`, {
    description: `This job is gaining traction`,
    duration: 4000,
  });
};

// In App.tsx or main layout
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" />
      {/* Rest of app */}
    </>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux for all state | TanStack Query for server state, useState for UI | 2020-2021 | 3x faster sync, less boilerplate |
| Manual WebSocket connections | Supabase Realtime | 2021+ | Managed connections, automatic reconnection |
| Drag-and-drop Kanban | Automatic rule-based migration | 2026 trend | Removes manual manipulation, trust-based mechanics |
| Client-side rate limiting | Database constraints | Always best practice | Atomic operations, impossible to bypass |

**Deprecated/outdated:**
- **Redux Toolkit for server state**: TanStack Query is now standard for server data caching in React
- **Polling for real-time updates**: Use Supabase Realtime subscriptions instead
- **react-beautiful-dnd**: Deprecated, use dnd-kit if drag-and-drop needed (but not needed this phase)

## Open Questions

Things that couldn't be fully resolved:

1. **What happens if user is viewing job detail when it migrates?**
   - What we know: CONTEXT.md says show notification "This job just moved to Trending!"
   - What's unclear: Should detail view stay open, or close and redirect to new lane?
   - Recommendation: Keep detail view open but show toast. User context preserved.

2. **Should progress bars show exact threshold numbers?**
   - What we know: CONTEXT.md says "Thresholds hidden from users"
   - What's unclear: Progress bar shows "3/5 to Trending" - is that revealing threshold?
   - Recommendation: Show relative progress ("60% to Trending") without exact numbers, or generic "3 clicks" without denominator.

3. **How to handle jobs that were already clicked before this phase?**
   - What we know: Phase 1 tracked clicks but didn't migrate lanes
   - What's unclear: Do we backfill lane assignments based on existing click counts?
   - Recommendation: Run migration on deployment to assign initial lanes based on current click counts.

## Sources

### Primary (HIGH confidence)

- Supabase Row Level Security Documentation: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Realtime Subscriptions: https://supabase.com/docs/guides/realtime/subscribing-to-database-changes
- TanStack Query Optimistic Updates: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- Vite Environment Variables: https://vite.dev/guide/env-and-mode

### Secondary (MEDIUM confidence)

- [React Query vs Supabase subscription discussion](https://github.com/orgs/supabase/discussions/5048) - Community pattern for integration
- [TkDodo's Blog: Optimistic Updates in React Query](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query) - Expert practitioner guidance
- [Supabase Composite Keys Guide](https://www.restack.io/docs/supabase-knowledge-supabase-composite-key-guide) - Implementation patterns
- [Build a Kanban Board with Shadcn](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html) - 2026 modern patterns

### Tertiary (LOW confidence)

- [Knock: Top 9 React notification libraries in 2026](https://knock.app/blog/the-top-notification-libraries-for-react) - Ecosystem survey
- [State Management in 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) - General patterns
- [Patterns.dev React 2026](https://www.patterns.dev/react/react-2026/) - Pattern aggregation

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - TanStack Query and Supabase are established, but specific integration patterns verified via secondary sources
- Architecture: MEDIUM - Patterns based on official docs and community best practices, but not exhaustively tested
- Pitfalls: MEDIUM - Based on common Supabase/React Query issues documented in community discussions, not project-specific testing

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stable ecosystem)
