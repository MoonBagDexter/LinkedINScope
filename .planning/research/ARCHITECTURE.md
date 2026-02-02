# Architecture Research

**Domain:** Real-time Kanban job board with engagement tracking
**Researched:** 2026-02-02
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Next.js)                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Kanban UI   │  │   Auth UI    │  │  Analytics   │              │
│  │  Components  │  │  Components  │  │  Dashboard   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│  ┌──────▼─────────────────▼─────────────────▼───────┐              │
│  │          State Management Layer                   │              │
│  │  (React Context / Zustand for UI state)           │              │
│  └──────┬─────────────────┬─────────────────┬───────┘              │
│         │                 │                 │                       │
├─────────┴─────────────────┴─────────────────┴─────────────────────┤
│                      SERVER LAYER (Next.js)                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Server      │  │  API Routes  │  │  Job Sync    │              │
│  │  Actions     │  │  (webhooks)  │  │  Scheduler   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
├─────────┴─────────────────┴─────────────────┴─────────────────────┤
│                     INTEGRATION LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐        │
│  │              Supabase Client (Browser/Server)            │        │
│  └─────────────────────────────────────────────────────────┘        │
│         │                          │                                │
│    ┌────▼──────┐              ┌───▼────────┐                        │
│    │ JSearch   │              │ Supabase   │                        │
│    │ API       │              │ Backend    │                        │
│    └───────────┘              └────────────┘                        │
├─────────────────────────────────────────────────────────────────────┤
│                      DATA LAYER (Supabase)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Postgres │  │ Realtime │  │   Auth   │  │ Storage  │            │
│  │ Database │  │  Engine  │  │ Service  │  │ Buckets  │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Kanban UI Components** | Render draggable cards and lanes, handle local drag state, animate transitions | React components with Framer Motion + @dnd-kit or react-beautiful-dnd |
| **State Management Layer** | Manage optimistic UI updates, track drag state, cache job data | React Context API or Zustand for client state |
| **Server Actions** | Execute mutations (click tracking, lane migrations), revalidate cache | Next.js Server Actions with `'use server'` directive |
| **API Routes** | Handle external webhooks, expose public endpoints if needed | Next.js Route Handlers in `/app/api` |
| **Job Sync Scheduler** | Fetch jobs from JSearch API, transform data, upsert to Supabase | Server-side cron job or Vercel Cron |
| **Supabase Client** | Query database, subscribe to realtime changes, manage auth sessions | `@supabase/ssr` for server, `@supabase/supabase-js` for client |
| **Realtime Engine** | Stream database changes via WebSocket, broadcast presence updates | Supabase Realtime subscriptions with filters |
| **Postgres Database** | Store jobs, user interactions, engagement metrics | Supabase Postgres with Row-Level Security (RLS) |

## Recommended Project Structure

```
linkedinscope/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Auth route group
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/               # Authenticated route group
│   │   ├── board/                 # Main Kanban board
│   │   │   ├── page.tsx           # Board page component
│   │   │   └── loading.tsx        # Streaming UI
│   │   ├── analytics/             # Engagement dashboard
│   │   └── layout.tsx             # Dashboard layout with auth check
│   ├── api/                       # API routes
│   │   ├── jobs/sync/route.ts     # Manual job sync endpoint
│   │   └── webhooks/              # External webhooks (if needed)
│   └── layout.tsx                 # Root layout
├── components/                    # React components
│   ├── kanban/                    # Kanban-specific components
│   │   ├── board.tsx              # Board container
│   │   ├── lane.tsx               # Draggable lane column
│   │   ├── job-card.tsx           # Individual job card
│   │   └── card-detail-modal.tsx  # Job detail view
│   ├── ui/                        # Shared UI primitives
│   └── providers/                 # Context providers
├── lib/                           # Utilities and services
│   ├── supabase/                  # Supabase client configs
│   │   ├── client.ts              # Browser client
│   │   ├── server.ts              # Server client
│   │   └── middleware.ts          # Auth middleware
│   ├── actions/                   # Server Actions
│   │   ├── engagement.ts          # Track clicks, update metrics
│   │   └── jobs.ts                # Job mutations
│   ├── services/                  # Business logic
│   │   ├── jsearch.ts             # JSearch API integration
│   │   ├── engagement-engine.ts   # Lane migration logic
│   │   └── job-transformer.ts     # Normalize job data
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-realtime-jobs.ts   # Supabase subscription hook
│   │   └── use-optimistic-lane.ts # Optimistic UI for drag
│   └── utils/                     # Helper functions
├── types/                         # TypeScript types
│   ├── database.types.ts          # Generated Supabase types
│   ├── job.types.ts               # Job domain types
│   └── engagement.types.ts        # Analytics types
├── supabase/                      # Supabase migrations
│   ├── migrations/
│   └── seed.sql
└── cron/                          # Scheduled jobs (Vercel Cron)
    └── sync-jobs.ts               # Periodic job fetching
```

### Structure Rationale

- **Route Groups `(auth)` and `(dashboard)`**: Organize pages with shared layouts without affecting URL structure
- **Colocation of Server Actions in `/lib/actions`**: Keeps server-side mutations separate from client components for clarity
- **Service Layer in `/lib/services`**: Encapsulates external API integrations and complex business logic away from components
- **Realtime Hooks in `/lib/hooks`**: Abstracts Supabase subscription patterns into reusable hooks with automatic cleanup
- **Supabase Type Generation**: Using CLI to generate TypeScript types from database schema ensures type safety

## Architectural Patterns

### Pattern 1: Realtime Subscription with Optimistic Updates

**What:** Subscribe to database changes at the table level with filters, update UI optimistically before server confirmation

**When to use:** For collaborative features where multiple users see the same data and need instant feedback

**Trade-offs:**
- **Pros**: Feels instant, reduces perceived latency, handles offline-first scenarios
- **Cons**: Requires rollback logic if server mutation fails, more complex state management

**Example:**
```typescript
// lib/hooks/use-realtime-jobs.ts
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useRealtimeJobs(laneId: string) {
  const [jobs, setJobs] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Initial fetch
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('lane_id', laneId)
        .order('position', { ascending: true })

      setJobs(data ?? [])
    }

    fetchJobs()

    // Subscribe to changes filtered by lane
    const channel = supabase
      .channel(`lane-${laneId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `lane_id=eq.${laneId}`  // Filter at DB level
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setJobs((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setJobs((prev) =>
              prev.map((job) =>
                job.id === payload.new.id ? payload.new : job
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setJobs((prev) => prev.filter((job) => job.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Cleanup on unmount - CRITICAL for performance
    return () => {
      supabase.removeChannel(channel)
    }
  }, [laneId, supabase])

  return jobs
}
```

### Pattern 2: Server Actions for External API Integration

**What:** Use Server Actions to call external APIs (JSearch) and mutate Supabase data in a single transaction

**When to use:** When you need to fetch data from external sources and store it securely without exposing API keys

**Trade-offs:**
- **Pros**: API keys stay server-side, automatic CSRF protection, single roundtrip for UI updates
- **Cons**: Cannot be called externally via HTTP, limited to POST requests

**Example:**
```typescript
// lib/actions/jobs.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function syncJobsFromJSearch(query: string) {
  const supabase = createServerActionClient({ cookies })

  // Fetch from external API
  const response = await fetch(`https://jsearch.p.rapidapi.com/search`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.JSEARCH_API_KEY!,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    },
    params: { query, num_pages: 1 }
  })

  const { data: jobsData } = await response.json()

  // Transform and upsert to Supabase
  const transformedJobs = jobsData.map(transformJobData)

  const { error } = await supabase
    .from('jobs')
    .upsert(transformedJobs, { onConflict: 'external_id' })

  if (error) throw error

  // Revalidate the board page cache
  revalidatePath('/board')

  return { count: transformedJobs.length }
}

function transformJobData(rawJob: any) {
  return {
    external_id: rawJob.job_id,
    title: rawJob.job_title,
    company: rawJob.employer_name,
    location: rawJob.job_city,
    description: rawJob.job_description,
    url: rawJob.job_apply_link,
    lane_id: 'new',  // Start in "new jobs" lane
    click_count: 0,
    last_clicked_at: null,
    position: 0
  }
}
```

### Pattern 3: Engagement-Based Lane Migration

**What:** Automatically move jobs between lanes based on engagement thresholds, with lane state persisted in database

**When to use:** For gamified workflows where user actions trigger state transitions

**Trade-offs:**
- **Pros**: Automatic workflow progression, data-driven UX, encourages engagement
- **Cons**: Requires careful threshold tuning, can be confusing if not communicated clearly

**Example:**
```typescript
// lib/services/engagement-engine.ts
export const LANE_THRESHOLDS = {
  new: { maxClicks: 0, nextLane: 'exploring' },
  exploring: { maxClicks: 3, nextLane: 'shortlist' },
  shortlist: { maxClicks: 10, nextLane: 'applied' },
  applied: { maxClicks: Infinity, nextLane: null }
}

export async function checkAndMigrateLane(jobId: string, currentLane: string, clickCount: number) {
  const threshold = LANE_THRESHOLDS[currentLane]

  if (clickCount >= threshold.maxClicks && threshold.nextLane) {
    // Trigger lane migration
    return {
      shouldMigrate: true,
      targetLane: threshold.nextLane
    }
  }

  return { shouldMigrate: false }
}

// lib/actions/engagement.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { checkAndMigrateLane } from '@/lib/services/engagement-engine'

export async function trackJobClick(jobId: string) {
  const supabase = createServerActionClient({ cookies })

  // Increment click count atomically
  const { data: job, error } = await supabase.rpc('increment_job_clicks', {
    job_id: jobId
  })

  if (error) throw error

  // Check if lane migration is needed
  const { shouldMigrate, targetLane } = await checkAndMigrateLane(
    jobId,
    job.lane_id,
    job.click_count
  )

  if (shouldMigrate) {
    await supabase
      .from('jobs')
      .update({ lane_id: targetLane })
      .eq('id', jobId)
  }

  return { migrated: shouldMigrate, newLane: targetLane }
}
```

### Pattern 4: Drag-and-Drop with Database Persistence

**What:** Use @dnd-kit for drag interactions, persist position changes via Server Actions with optimistic updates

**When to use:** When users need manual control over item ordering with real-time sync

**Trade-offs:**
- **Pros**: Smooth UX with hardware-accelerated animations, supports keyboard navigation (accessibility)
- **Cons**: Complex state synchronization between local drag state and database state

**Example:**
```typescript
// components/kanban/board.tsx
'use client'

import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'
import { useOptimistic } from 'react'
import { updateJobLane } from '@/lib/actions/jobs'

export function KanbanBoard({ initialJobs }) {
  const [jobs, setOptimisticJobs] = useOptimistic(
    initialJobs,
    (state, { jobId, newLane, newPosition }) => {
      return state.map((job) =>
        job.id === jobId
          ? { ...job, lane_id: newLane, position: newPosition }
          : job
      )
    }
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const jobId = active.id
    const newLaneId = over.data.current?.laneId
    const newPosition = over.data.current?.position

    // Optimistic update
    setOptimisticJobs({ jobId, newLane: newLaneId, newPosition })

    // Persist to database
    await updateJobLane(jobId, newLaneId, newPosition)
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      {/* Kanban lanes */}
    </DndContext>
  )
}
```

## Data Flow

### Request Flow: Job Click Tracking

```
[User clicks job card]
    ↓
[onClick handler] → [Server Action: trackJobClick]
    ↓                      ↓
[Optimistic UI]     [Supabase RPC: increment_clicks]
    ↓                      ↓
[Update local]      [Check engagement threshold]
    ↓                      ↓
[Show feedback]     [Migrate lane if needed]
                           ↓
                    [Realtime broadcast to all clients]
                           ↓
                    [Other users see lane migration]
```

### Request Flow: Job Sync from External API

```
[Cron trigger / Manual sync]
    ↓
[Server Action: syncJobsFromJSearch]
    ↓
[Fetch from JSearch API]
    ↓
[Transform job data]
    ↓
[Upsert to Supabase (dedupe by external_id)]
    ↓
[Revalidate cache]
    ↓
[Realtime broadcast INSERT events]
    ↓
[Client receives new jobs via subscription]
    ↓
[UI updates automatically]
```

### State Management Flow

```
[Server State (Supabase)]
    ↓ (initial load)
[Server Component fetch] → [Client receives initial data]
    ↓                           ↓
[Pass to Client]         [Subscribe to realtime updates]
    ↓                           ↓
[Realtime Hook]          [Merge server changes into local state]
    ↓
[Local UI State (optimistic updates for drags)]
    ↓
[User interactions] → [Server Actions] → [Database mutations]
                                             ↓
                                    [Broadcast to all clients]
```

### Key Data Flows

1. **Initial Page Load**: Server Component fetches jobs from Supabase, passes to Client Component, which establishes realtime subscription
2. **Job Sync**: Scheduled job fetches from JSearch API, transforms data, upserts to database, triggers realtime broadcast
3. **Engagement Tracking**: User clicks job card, Server Action increments counter, checks thresholds, migrates lane if needed, broadcasts change
4. **Drag-and-Drop**: User drags card, optimistic UI update, Server Action persists new position, realtime sync to other clients

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-1k users** | Monolith is fine - single Next.js app, direct Supabase connections, realtime subscriptions per page |
| **1k-10k users** | Optimize realtime: Subscribe to tables with filters (not per-row), use debouncing for frequent updates, enable Supabase connection pooling |
| **10k-100k users** | Add read replicas for analytics queries, use Supabase Edge Functions for heavy processing, implement rate limiting on JSearch API calls, consider caching job data in Redis |
| **100k+ users** | Split realtime from transactional DB, use Broadcast channels instead of Postgres Changes for user presence, implement CDN caching for job listings, consider geographic distribution |

### Scaling Priorities

1. **First bottleneck: Realtime connections** - Supabase Realtime can handle 10k+ concurrent WebSocket connections, but you'll hit limits if every user subscribes to all lanes. Solution: Filter subscriptions by visible lanes only, unsubscribe on route changes.

2. **Second bottleneck: JSearch API rate limits** - External API has rate limits and costs. Solution: Implement intelligent caching (12-24 hours for job postings), batch requests, deduplicate by `external_id` to avoid redundant fetches.

3. **Third bottleneck: Animation performance** - Framer Motion can lag with 100+ cards on screen. Solution: Use `LazyMotion` and virtualize long lists, animate only `transform` and `opacity` (GPU-accelerated), disable animations on low-end devices.

## Anti-Patterns

### Anti-Pattern 1: Per-Row Realtime Subscriptions

**What people do:** Create a Supabase subscription for each job card component
```typescript
// DON'T DO THIS
function JobCard({ jobId }) {
  useEffect(() => {
    const channel = supabase
      .channel(`job-${jobId}`)
      .on('postgres_changes', { filter: `id=eq.${jobId}` }, callback)
      .subscribe()
  }, [jobId])
}
```

**Why it's wrong:** Opens one WebSocket connection per card, kills performance with 50+ jobs on screen, hits Supabase connection limits quickly

**Do this instead:** Subscribe to the entire table with lane filtering at the parent component, distribute updates to child components via props
```typescript
// DO THIS
function KanbanBoard() {
  const jobs = useRealtimeJobs() // One subscription for all jobs
  return lanes.map((lane) => (
    <Lane jobs={jobs.filter((j) => j.lane_id === lane.id)} />
  ))
}
```

### Anti-Pattern 2: Storing Engagement Metrics in Client State

**What people do:** Track click counts in React state or localStorage, sync to database occasionally
```typescript
// DON'T DO THIS
function JobCard({ job }) {
  const [clicks, setClicks] = useState(job.click_count)

  const handleClick = () => {
    setClicks(clicks + 1)
    localStorage.setItem(`clicks-${job.id}`, clicks + 1)
    // Maybe sync to server later?
  }
}
```

**Why it's wrong:** Data loss if user clears storage, no way to aggregate analytics across users, lane migrations won't trigger correctly

**Do this instead:** Track every interaction server-side immediately, use optimistic UI for feedback
```typescript
// DO THIS
function JobCard({ job }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await trackJobClick(job.id)  // Server Action
    })
  }

  return <Card onClick={handleClick} className={isPending ? 'opacity-50' : ''} />
}
```

### Anti-Pattern 3: Forgetting Realtime Subscription Cleanup

**What people do:** Create subscriptions without cleanup logic in useEffect
```typescript
// DON'T DO THIS
useEffect(() => {
  supabase
    .channel('jobs')
    .on('postgres_changes', { table: 'jobs' }, callback)
    .subscribe()
  // No cleanup!
}, [])
```

**Why it's wrong:** Memory leaks, orphaned WebSocket connections, exceeds Supabase connection limits, subscriptions continue after component unmounts

**Do this instead:** Always return cleanup function to remove channels
```typescript
// DO THIS
useEffect(() => {
  const channel = supabase
    .channel('jobs')
    .on('postgres_changes', { table: 'jobs' }, callback)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)  // CRITICAL
  }
}, [])
```

### Anti-Pattern 4: Using API Routes for Simple Mutations

**What people do:** Create API routes for every database mutation instead of using Server Actions
```typescript
// DON'T DO THIS (unless you need external access)
// app/api/jobs/[id]/click/route.ts
export async function POST(request, { params }) {
  const supabase = createServerClient()
  await supabase.from('jobs').update({ ... }).eq('id', params.id)
  return Response.json({ success: true })
}
```

**Why it's wrong:** More boilerplate, no automatic CSRF protection, requires manual revalidation, adds HTTP overhead

**Do this instead:** Use Server Actions for mutations called from your app
```typescript
// DO THIS
// lib/actions/jobs.ts
'use server'
export async function trackJobClick(jobId: string) {
  const supabase = createServerActionClient({ cookies })
  await supabase.from('jobs').update({ ... }).eq('id', jobId)
  revalidatePath('/board')  // Automatic cache revalidation
}
```

**Exception:** Use API Routes when you need external HTTP access (webhooks, mobile apps, third-party integrations)

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **JSearch API** | Server Action or API Route with API key in env vars | Rate limit: Track usage, implement 24-hour cache for job postings, deduplicate by `job_id` |
| **Supabase Auth** | Middleware for route protection, `createServerClient` for session management | Use `@supabase/ssr` package for App Router, implement Row Level Security (RLS) policies |
| **Supabase Realtime** | Client-side subscriptions with table-level filtering | Subscribe in `useEffect`, filter at DB level (`filter: 'lane_id=eq.new'`), always cleanup on unmount |
| **Vercel Cron** | Export function in `/app/api/cron/sync-jobs/route.ts` with `export const runtime = 'edge'` | Secure with `CRON_SECRET` env var, use for periodic job fetching (every 6-12 hours) |
| **Framer Motion** | Import animations via `LazyMotion` for code-splitting | Use `domAnimation` features, animate only `transform` and `opacity`, disable on `prefers-reduced-motion` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Client Component ↔ Server Action** | Direct function calls (automatic serialization) | Server Actions are imported and called like regular async functions, return serializable data only |
| **Server Component ↔ Supabase** | Direct database queries using `createServerClient` | Can fetch data during SSR, no client bundle size impact |
| **Client Component ↔ Supabase Realtime** | WebSocket subscriptions managed by `@supabase/supabase-js` | Browser client only, requires proper cleanup |
| **Kanban Board ↔ Job Cards** | Props for data, callbacks for actions | Parent manages subscriptions, children render and handle interactions |
| **State Management ↔ Components** | React Context for global UI state, props for local state | Avoid prop drilling for theme/user, use Server Actions instead of client-side state mutations |

## Build Order Recommendations

Based on component dependencies and data flow requirements, recommended build sequence:

### Phase 1: Foundation (Week 1)
1. **Supabase schema and RLS policies** - Database structure must exist before anything else
2. **Authentication flow** - Required for all protected routes and RLS
3. **Server/Client Supabase clients** - Needed for all data fetching

### Phase 2: Data Integration (Week 1-2)
4. **JSearch API integration** - External data source for job listings
5. **Server Action for job sync** - Bridge between API and database
6. **Job data transformation** - Normalize external data to internal schema

### Phase 3: Core UI (Week 2-3)
7. **Basic Kanban layout** - Static lanes before drag-and-drop
8. **Job card components** - Display job data without interactions
9. **Realtime subscription hook** - Live updates for job changes

### Phase 4: Interactions (Week 3-4)
10. **Drag-and-drop implementation** - Manual lane changes
11. **Click tracking Server Action** - Engagement metrics
12. **Engagement engine** - Automatic lane migrations based on thresholds

### Phase 5: Polish (Week 4)
13. **Framer Motion animations** - Smooth transitions
14. **Optimistic UI** - Instant feedback for actions
15. **Error handling and loading states** - Production readiness

**Critical path dependencies:**
- Realtime subscriptions require database schema
- Drag-and-drop requires job cards to exist
- Engagement engine requires click tracking to be functional
- Optimistic UI requires Server Actions to be stable

## Sources

**High Confidence (Official Documentation):**
- [Supabase Realtime Architecture](https://supabase.com/docs/guides/realtime) - Realtime components and subscription patterns
- [Using Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) - Next.js integration patterns
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) - Server-side mutations

**Medium Confidence (Verified Blog Posts & Tutorials):**
- [Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices) - Per-table subscriptions, cleanup patterns
- [Building Scalable Real-Time Systems](https://medium.com/@ansh91627/building-scalable-real-time-systems-a-deep-dive-into-supabase-realtime-architecture-and-eccb01852f2b) - Optimistic UI patterns
- [Next.js Server Actions vs API Routes](https://dev.to/myogeshchavan97/nextjs-server-actions-vs-api-routes-dont-build-your-app-until-you-read-this-4kb9) - When to use each pattern
- [Framer Motion Performance Tips](https://tillitsdone.com/blogs/framer-motion-performance-tips/) - GPU acceleration and LazyMotion
- [Building a Kanban Board with Shadcn](https://marmelab.com/blog/2026/01/15/building-a-kanban-board-with-shadcn.html) - Drag-and-drop architecture

**Medium Confidence (Ecosystem Discovery):**
- [Data Engineering Trends 2026](https://www.trigyn.com/insights/data-engineering-trends-2026-building-foundation-ai-driven-enterprises) - Real-time analytics architecture
- [Software Architecture Patterns 2026](https://www.sayonetech.com/blog/software-architecture-patterns/) - Event-driven architecture for real-time systems

---
*Architecture research for: LinkedInScope gamified job aggregator*
*Researched: 2026-02-02*
