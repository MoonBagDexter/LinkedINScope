# Technology Stack Research

**Project:** LinkedInScope
**Domain:** Gamified Job Aggregator with Real-Time Updates
**Researched:** 2026-02-02
**Overall Confidence:** HIGH

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1+ | Full-stack React framework with SSR/SSG | Latest stable release with Turbopack, built on React 19. Default template includes everything needed. App Router is now standard. Zero-config deployment to Vercel. |
| React | 19.2+ | UI library | Required peer dependency for Next.js 16. Includes View Transitions, useEffectEvent, and Activity components. Stable APIs for Actions, Suspense, and concurrent rendering. |
| TypeScript | 5.x | Type safety | Ships by default with Next.js 16. Strict mode enabled by default since Next.js 13.5.1. Prevents entire classes of bugs. |

**Confidence:** HIGH - Verified from [Next.js 16.1 release](https://nextjs.org/blog/next-16-1), [Next.js updates January 2026](https://releasebot.io/updates/vercel/next-js)

### Database & Backend

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Supabase | Latest | Backend-as-a-Service with Postgres + Realtime | Handles 10,000+ concurrent realtime connections. Built-in auth, Postgres database, realtime subscriptions via WebSockets. Perfect for job board engagement tracking. |
| @supabase/supabase-js | 2.90.1+ | JavaScript client for Supabase | Latest stable version as of Jan 2026. Actively maintained with releases every few weeks. Note: Node.js 18 support dropped (EOL April 2025). |
| @supabase/ssr | Latest | SSR support for Next.js App Router | Successor to old auth helpers. Designed specifically for Next.js App Router + Server Components. Handles cookie-based sessions securely. |

**Confidence:** HIGH - Verified from [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js), [Supabase Realtime docs](https://supabase.com/docs/guides/realtime), [Supabase best practices 2026](https://www.leanware.co/insights/supabase-best-practices)

### Styling & Animation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Tailwind CSS | 4.0.7 | Utility-first CSS framework | Included in Next.js 16 default template. v4.0.7 is stable with Next.js 16 + Turbopack (v4.1.18 has known build issues). Zero runtime, just build-time processing. |
| Framer Motion | 12.27.0+ | Animation library | Officially supports React 19 as of Jan 2026. Perfect for playful Kanban animations and lane transitions. Declarative API, excellent performance. |

**Confidence:** HIGH - Verified from [Framer Motion npm](https://www.npmjs.com/package/framer-motion), [Next.js 16 + Tailwind setup](https://medium.com/@mernstackdevbykevin/next-js-16-tailwind-css-building-a-responsive-site-with-the-latest-stack-bd0df3514465), [Tailwind CSS Next.js guide](https://tailwindcss.com/docs/guides/nextjs)

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hello-pangea/dnd | Latest | Drag-and-drop for Kanban board | Community-maintained fork of react-beautiful-dnd (Atlassian stopped maintenance). High-level abstraction perfect for list-based UI like Kanban lanes. Accessible with keyboard/screen reader support. |
| zod | Latest | Schema validation | Validate server actions and form inputs. Type-safe validation that matches TypeScript types. Use `safeParse()` for server action validation. Share schemas between client/server. |
| lucide-react | Latest | Icon library | 1000+ icons, tree-shakable, consistent design language. Import individually for optimal bundle size. Fully customizable via props. |
| date-fns | Latest | Date/time utilities | Lightweight (vs moment.js), functional programming style, tree-shakable. Use for "X minutes ago" timestamps and job posting date formatting. |
| @tanstack/react-query | 5.x | Data fetching & caching | Pairs with Supabase for client-side cache management. Use with @supabase-cache-helpers for optimistic updates. Handles re-fetching after mutations. |
| @supabase-cache-helpers/storage-react-query | Latest | Supabase + React Query bridge | Provides proper QueryKeys for Supabase queries. Simplifies cache invalidation with realtime subscriptions. |

**Confidence:** HIGH for dnd (verified from [Kanban libraries 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)), MEDIUM for others (standard patterns but versions evolving)

### External APIs

| API | Purpose | Integration Notes |
|-----|---------|-------------------|
| JSearch (RapidAPI) | Job listings from Google for Jobs | 30+ data points per job. Sources LinkedIn, Indeed, Glassdoor in real-time. Generous free tier. Well-maintained by OpenWeb Ninja. Use for initial job ingestion. |

**Confidence:** HIGH - Verified from [JSearch RapidAPI](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch), [JSearch overview](https://www.openwebninja.com/api/jsearch)

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Linting | Included in Next.js 16 default template. Configure with Next.js recommended rules. |
| Prettier | Code formatting | Standard for consistency. Integrates with ESLint. |
| Turbopack | Build tool | Stable and enabled by default in Next.js 16. Significantly faster than Webpack for dev and prod builds. |

## Installation

```bash
# Initialize Next.js 16 project with defaults (includes TypeScript, Tailwind, ESLint)
npx create-next-app@latest linkedinscope --typescript --tailwind --app --eslint

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr

# Animation and UI
npm install framer-motion lucide-react

# Kanban drag-and-drop
npm install @hello-pangea/dnd

# Form validation
npm install zod

# Date utilities
npm install date-fns

# Data fetching and caching (if using React Query pattern)
npm install @tanstack/react-query @supabase-cache-helpers/storage-react-query

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not Alternative |
|----------|-------------|-------------|---------------------|
| Framework | Next.js 16 | Remix, Vite + React Router | Next.js has best-in-class Vercel integration, more mature ecosystem for SSR + realtime, built-in caching with "use cache" directive. |
| Backend | Supabase | Firebase, PlanetScale + Auth0 | Supabase combines auth + database + realtime in one. Postgres is more flexible than Firestore. Better pricing at scale. |
| Animation | Framer Motion | React Spring, GSAP | Framer Motion has best React 19 support, most declarative API, perfect for UI transitions (not physics simulations). |
| Drag-and-drop | @hello-pangea/dnd | dnd-kit, pragmatic-drag-and-drop | @hello-pangea is drop-in replacement for react-beautiful-dnd with same API. Higher-level abstraction than dnd-kit. Better for list-based Kanban vs flexible grids. |
| Date library | date-fns | Day.js, Luxon | date-fns is most tree-shakable, functional style matches project. Day.js is smaller but OOP style. Both good choices. |
| Validation | zod | yup, joi | zod has best TypeScript inference, works seamlessly with Next.js server actions. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-beautiful-dnd | Maintenance stopped by Atlassian in 2022 | @hello-pangea/dnd (community fork) |
| Moment.js | Massive bundle size (67kb gzipped), deprecated | date-fns or Day.js (both <10kb) |
| React Query v4 | Outdated, v5 has better TypeScript and DX | @tanstack/react-query v5+ |
| Tailwind CSS 4.1.18 | Known build issues with Next.js 16 + Turbopack | Tailwind CSS 4.0.7 (stable) |
| localStorage for auth tokens | XSS vulnerabilities | HTTP-only cookies via @supabase/ssr |
| polling for realtime updates | Wastes resources, adds latency | Supabase Realtime WebSockets |

## Stack Patterns by Feature

### Real-Time Job Engagement Tracking

**Pattern:** Supabase Realtime + React Query with Cache Helpers

```typescript
// Subscribe to click_count updates on jobs table
const { data: jobs } = useQuery({
  queryKey: ['jobs', 'lane', laneId],
  queryFn: () => supabase.from('jobs').select('*').eq('lane', laneId)
})

// In useEffect: Subscribe to realtime changes
useEffect(() => {
  const channel = supabase
    .channel(`jobs:lane:${laneId}`)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'jobs' },
      (payload) => {
        queryClient.invalidateQueries(['jobs', 'lane', laneId])
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [laneId])
```

**Why:** Combines client-side caching (React Query) with real-time updates (Supabase). Cache Helpers simplify invalidation.

### Kanban Lane Transitions with Animation

**Pattern:** Framer Motion layout animations + @hello-pangea/dnd

```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'

// Each job card
<Draggable draggableId={job.id} index={index}>
  {(provided) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
    >
      <JobCard job={job} />
    </motion.div>
  )}
</Draggable>
```

**Why:** layout prop handles automatic position animations when jobs change lanes. @hello-pangea provides drag mechanics.

### Server Actions with Validation

**Pattern:** Zod validation in Next.js server actions

```typescript
'use server'

import { z } from 'zod'

const trackClickSchema = z.object({
  jobId: z.string().uuid(),
  userId: z.string().uuid()
})

export async function trackQuickApply(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const result = trackClickSchema.safeParse(raw)

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  // Update click count in Supabase
  const { data, error } = await supabase
    .from('job_clicks')
    .insert({ job_id: result.data.jobId, user_id: result.data.userId })

  return { success: true }
}
```

**Why:** Server-side validation prevents malicious input. safeParse returns type-safe results. Flatten formats errors for forms.

### Authentication with Supabase

**Pattern:** @supabase/ssr for App Router auth

```typescript
// app/auth/callback/route.ts - Handle email confirmation
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookies().set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookies().set({ name, value: '', ...options })
          },
        },
      }
    )

    await supabase.auth.verifyOtp({ token_hash, type })
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

**Why:** HTTP-only cookies prevent XSS attacks. Server-side token exchange is secure. Works with Server Components.

## Realtime Best Practices

Based on [Supabase Realtime best practices](https://www.leanware.co/insights/supabase-best-practices):

1. **Use private channels in production** - Enable RLS policies for message authorization
2. **Filter subscriptions** - Always filter realtime subscriptions (e.g., by lane_id), never subscribe to entire table
3. **Enable selectively** - Only enable realtime on necessary columns. Disable UPDATE/DELETE events if you only need INSERT
4. **Batch client updates** - Debounce UI re-renders when receiving rapid updates
5. **Handle reconnection** - Reload data on subscription errors (connection loss can miss updates)

**Default limits:**
- Max 100 channels per tenant
- Max 200 concurrent users per channel
- Max 100 events per second

## Version Compatibility

| Package | Requires | Notes |
|---------|----------|-------|
| Next.js 16.1 | React 19.2+, Node.js 20+ | Node.js 18 reached EOL April 2025 |
| Framer Motion 12.27.0 | React 19.x | Ref access errors fixed in Jan 2026 updates |
| @supabase/supabase-js 2.90.1 | Node.js 20+ | Dropped Node.js 18 support in v2.79.0 |
| Tailwind CSS 4.0.7 | Next.js 16 + Turbopack | v4.1.18 has known build issues |
| @hello-pangea/dnd | React 18+ | Works with React 19 (no breaking changes) |

## Deployment Stack

| Service | Purpose | Why |
|---------|---------|-----|
| Vercel | Hosting + Edge Functions | Zero-config Next.js deployment. Edge runtime for global performance. Built by Next.js creators. Free tier sufficient for MVP. |
| Supabase Cloud | Database + Realtime + Auth | Generous free tier (500MB database, 2GB bandwidth, 50,000 monthly active users). Auto-scaling realtime. |

**Deployment pattern:**
1. Push to GitHub
2. Connect Vercel to repo (auto-deploys on push)
3. Add Supabase env vars to Vercel
4. Deploy completes in ~2 minutes

## Architecture Decision Records

### ADR-1: Why Next.js 16 over Remix?

**Decision:** Use Next.js 16 with App Router

**Rationale:**
- Vercel integration is unmatched (creators of Next.js)
- Turbopack now stable and faster than Vite
- "use cache" directive simplifies caching strategy
- Larger ecosystem for realtime patterns with Supabase
- React Server Components are more mature in Next.js

**Trade-offs:** Remix has better form handling patterns and simpler mental model. But Next.js has better realtime/SSR documentation for our use case.

### ADR-2: Why Supabase over Firebase?

**Decision:** Use Supabase for backend

**Rationale:**
- Postgres > Firestore for relational data (jobs, users, clicks)
- Realtime built on Postgres triggers (vs Firestore's document listeners)
- Better pricing at scale (no per-read charges)
- SQL gives more flexibility for analytics queries
- Row-level security matches Next.js server-side patterns

**Trade-offs:** Firebase has larger ecosystem and mobile SDKs. But we're web-first and need relational data.

### ADR-3: Why @hello-pangea/dnd over dnd-kit?

**Decision:** Use @hello-pangea/dnd for Kanban

**Rationale:**
- Higher-level abstraction for list-based drag-and-drop
- Drop-in replacement for react-beautiful-dnd (proven API)
- Accessibility built-in (keyboard, screen reader)
- Perfect for 3-lane Kanban (not complex grid layouts)

**Trade-offs:** dnd-kit is more flexible for grids/boards. But we have simple 3-lane layout, don't need that flexibility.

### ADR-4: React Query vs Supabase-only?

**Decision:** Use React Query + Supabase Cache Helpers

**Rationale:**
- Client-side caching reduces Supabase read costs
- Optimistic updates for better UX (immediate click feedback)
- Automatic re-fetching after mutations
- Cache invalidation on realtime events

**Trade-offs:** Adds complexity vs pure Supabase client. But caching is critical for engagement tracking (lots of reads).

## Sources

**High Confidence (Official docs + npm):**
- [Next.js 16 Release](https://nextjs.org/blog/next-16) - Framework features
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1) - Latest version
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) - Version 2.90.1
- [Framer Motion npm](https://www.npmjs.com/package/framer-motion) - React 19 support
- [Supabase Realtime docs](https://supabase.com/docs/guides/realtime) - Realtime architecture
- [Next.js + Supabase Auth](https://supabase.com/docs/guides/auth/server-side/nextjs) - SSR auth patterns
- [Tailwind CSS Next.js guide](https://tailwindcss.com/docs/guides/nextjs) - Official setup

**Medium Confidence (Recent articles + community):**
- [Supabase best practices 2026](https://www.leanware.co/insights/supabase-best-practices) - Production patterns
- [Top 5 Drag-and-Drop Libraries for React](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - Library comparison
- [Kanban Board with dnd-kit](https://radzion.com/blog/kanban/) - Implementation patterns
- [React Query with Supabase](https://makerkit.dev/blog/saas/supabase-react-query) - Integration guide
- [JSearch API overview](https://www.openwebninja.com/api/jsearch) - Job API capabilities

**Context:** All searches conducted 2026-02-02 with year filters for currency.

---

**Stack confidence:** HIGH - Core technologies verified from official sources. Supporting libraries based on established patterns.

**Last updated:** 2026-02-02
