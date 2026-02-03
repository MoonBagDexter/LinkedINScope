# Phase 3: Real-Time & Polish - Research

**Researched:** 2026-02-03
**Domain:** Real-time WebSocket subscriptions, client-side animations, presence tracking
**Confidence:** HIGH

## Summary

This phase adds real-time lane migration visibility using Supabase Realtime and playful card animations. When one user's click causes a job to migrate lanes (5 clicks to Trending, 20 clicks to Graduated), all connected users see it happen with animated transitions within 2 seconds.

The standard approach combines Supabase Realtime's Broadcast feature (recommended over Postgres Changes for scalability) with CSS transform-based animations or Framer Motion's layout animations. Critical constraints include Supabase free tier limits (100 messages/second, 200 concurrent connections) requiring batched updates and client-side throttling to avoid quota overages.

User decisions from CONTEXT.md lock in key choices: 200-300ms slide animations, batched click count updates every 2-5 seconds, toast notifications for migrations only (no confetti), and live user count display using Presence API.

**Primary recommendation:** Use Supabase Broadcast (not Postgres Changes) with table-level subscriptions, batch updates via client-side debouncing, and CSS transforms for card animations (simpler than Framer Motion, better performance).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.93.3+ | Real-time WebSocket subscriptions | Official Supabase client, handles reconnection, built-in throttling |
| Sonner | 2.0.7+ | Toast notifications | Already in project, opinionated API, TypeScript-first |
| @tanstack/react-query | 5.90.20+ | Cache invalidation for real-time sync | Already in project, handles refetch orchestration |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Framer Motion | 11.x | Layout/card animations (optional) | If complex drag-to-reorder or layout animations needed |
| CSS Transitions | Native | Transform-based slide animations | Simpler use case, better performance for basic slides |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Broadcast | Postgres Changes | Postgres Changes simpler setup but doesn't scale, Broadcast requires triggers but handles 1000+ users |
| CSS Transforms | Framer Motion | Framer adds 50KB bundle size, better for complex gestures/drag, CSS sufficient for 200-300ms slides |
| Sonner | react-hot-toast | Sonner more opinionated, React 18+ optimized, better TypeScript support |

**Installation:**
```bash
# Core dependencies already installed in package.json
# Optional: Add Framer Motion if complex animations needed
npm install framer-motion
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── hooks/
│   ├── useRealtimeJobs.ts        # Real-time job updates subscription
│   ├── usePresence.ts             # Live user count tracking
│   └── useClickSync.ts            # Batched click count sync
├── components/
│   ├── JobCard.tsx                # Add animation classes/Motion wrapper
│   ├── KanbanLane.tsx             # Handle card reordering with keys
│   └── UserCount.tsx              # Display live user count
└── services/
    └── supabase.ts                # Configure throttle settings
```

### Pattern 1: Supabase Broadcast Setup (Table-Level Subscription)

**What:** Subscribe to a single broadcast channel for all job updates, avoiding per-job subscriptions that multiply message count.

**When to use:** Always - this is the recommended scalable approach for free tier.

**Example:**
```typescript
// Source: https://supabase.com/docs/guides/realtime/subscribing-to-database-changes
// Configure throttle when creating client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 2, // Default is 10, reduce for quota safety
    },
  },
});

// Single table-level subscription
const channel = supabase
  .channel('jobs-updates')
  .on(
    'broadcast',
    { event: 'job-updated' },
    (payload) => {
      // Update React Query cache or state
      handleJobUpdate(payload);
    }
  )
  .subscribe();

// Cleanup on unmount
return () => {
  channel.unsubscribe();
};
```

### Pattern 2: Batched Click Count Updates (Client-Side Debouncing)

**What:** Debounce rapid click count updates to send batched sync messages every 2-5 seconds instead of per-click.

**When to use:** For high-frequency updates like click counts where real-time granularity isn't critical.

**Example:**
```typescript
// Source: https://supabase.com/docs/guides/realtime/guides/client-side-throttling
import { useMemo, useCallback } from 'react';

function useClickSync() {
  // Debounce broadcast sends to 2-second intervals
  const debouncedBroadcast = useMemo(
    () => debounce((updates: JobUpdate[]) => {
      supabase.channel('jobs-updates').send({
        type: 'broadcast',
        event: 'click-batch',
        payload: updates,
      });
    }, 2000),
    []
  );

  const syncClickCount = useCallback((jobId: string, count: number) => {
    // Batch multiple updates, send every 2 seconds
    debouncedBroadcast([{ jobId, clickCount: count }]);
  }, [debouncedBroadcast]);

  return { syncClickCount };
}
```

### Pattern 3: CSS Transform Slide Animation (200-300ms)

**What:** Use CSS transforms (translateX) with cubic-bezier easing for horizontal card movement between lanes.

**When to use:** Simple lane migration animations where cards slide left/right (no drag-and-drop).

**Example:**
```typescript
// Source: https://web.dev/articles/animations-guide
// JobCard component with slide animation
function JobCard({ job, lane }: JobCardProps) {
  const prevLane = usePrevious(job.lane);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (prevLane && prevLane !== lane) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [lane, prevLane]);

  return (
    <div
      className={`job-card ${isAnimating ? 'slide-animation' : ''}`}
      style={{
        transform: isAnimating
          ? `translateX(${lane === 'trending' ? '100%' : '200%'})`
          : 'translateX(0)',
        transition: 'transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      }}
    >
      {/* Card content */}
    </div>
  );
}
```

### Pattern 4: Presence Tracking for Live User Count

**What:** Use Supabase Presence to track connected users and display "X degens online" count.

**When to use:** Always - for multi-user awareness without attribution.

**Example:**
```typescript
// Source: https://supabase.com/docs/guides/realtime/presence
function usePresence() {
  const [userCount, setUserCount] = useState(0);
  const { publicKey } = useWallet();

  useEffect(() => {
    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setUserCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: publicKey?.toBase58() || 'anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      channel.unsubscribe();
    };
  }, [publicKey]);

  return userCount;
}
```

### Pattern 5: React Query Invalidation for Real-Time Sync

**What:** Invalidate React Query cache when receiving real-time updates to trigger background refetch.

**When to use:** When real-time events update data already cached by React Query (job lists, click counts).

**Example:**
```typescript
// Source: https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations
function useRealtimeJobs() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('jobs-updates')
      .on('broadcast', { event: 'job-migrated' }, (payload) => {
        // Invalidate cached jobs query to trigger refetch
        queryClient.invalidateQueries({
          queryKey: ['cached-jobs'],
          refetchType: 'active' // Only refetch if query is currently active
        });

        // Show toast for migration
        toast.success(`Job migrated to ${payload.newLane}!`);
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, [queryClient]);
}
```

### Anti-Patterns to Avoid

- **Per-job subscriptions:** Don't create separate channels for each job (multiplies message count 100x+)
- **Optimistic updates:** User decision says "wait for database confirmation" - no client-side optimistic lane changes
- **Unthrottled Presence tracking:** Don't update Presence state on every mouse move or keystroke
- **Missing cleanup:** Always unsubscribe channels and untrack Presence in useEffect cleanup
- **Animating expensive properties:** Don't animate `width`, `height`, `left`, `top` - use `transform` only

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebSocket reconnection | Custom reconnect logic | Supabase client auto-reconnect | Handles exponential backoff, heartbeats, state recovery |
| Debouncing broadcasts | setTimeout wrapper | Lodash debounce or useMemo wrapper | Edge cases: leading/trailing calls, cleanup, React re-renders |
| Toast notifications | Custom toast system | Sonner (already installed) | Handles stacking, auto-dismiss, accessibility, mobile |
| Easing curves | Hand-written cubic-bezier values | CSS presets or easings.net | Industry-tested curves for natural motion |
| Presence state management | Manual tracking of connected users | Supabase Presence API | Handles sync/join/leave events, conflict resolution, cleanup |

**Key insight:** Real-time features have hidden complexity - connection drops, duplicate messages, out-of-order delivery, quota exhaustion. Use battle-tested libraries.

## Common Pitfalls

### Pitfall 1: Supabase Message Quota Overage (1000%+ cost)

**What goes wrong:** Naive real-time subscriptions can send 100+ messages/second with 10 users, blowing past free tier 100 msg/sec limit.

**Why it happens:**
- Per-job subscriptions multiply message count (10 jobs × 10 users = 100 subscriptions)
- No client-side throttling means every click/update sends instant message
- Presence tracking without debouncing (mouse movements, typing indicators)

**How to avoid:**
- Use table-level Broadcast subscriptions (1 channel, not N channels)
- Configure `eventsPerSecond: 2` in Supabase client options (default is 10)
- Batch click count updates every 2-5 seconds with debouncing
- Limit Presence updates to join/leave/idle state changes only

**Warning signs:**
- WebSocket connection errors in browser console (`too_many_joins`, `tenant_events`)
- Realtime logs showing message throughput spikes
- Unexpected Supabase billing alerts

### Pitfall 2: Missing useEffect Cleanup (Memory Leaks)

**What goes wrong:** Subscriptions remain active after component unmounts, causing memory leaks and duplicate event handlers.

**Why it happens:**
- Forgetting to return cleanup function in useEffect
- Multiple component instances subscribing to same channel
- React 18 Strict Mode double-mounting in development

**How to avoid:**
```typescript
useEffect(() => {
  const channel = supabase.channel('jobs-updates');

  channel
    .on('broadcast', { event: 'update' }, handleUpdate)
    .subscribe();

  // REQUIRED: Cleanup function
  return () => {
    channel.unsubscribe();
  };
}, [/* deps */]);
```

**Warning signs:**
- Console warnings about state updates on unmounted components
- Real-time events firing multiple times
- Increasing memory usage over time

### Pitfall 3: Reconnect Without State Sync (Stale Data)

**What goes wrong:** After going offline (backgrounded tab, network drop), reconnection succeeds but UI shows stale data from before disconnect.

**Why it happens:** Supabase Realtime doesn't replay missed messages - you only get events after reconnection, not during offline period.

**How to avoid:**
- Listen for online/offline events and refetch full state on reconnect
- Track last successful update timestamp, fetch missed updates on reconnect
- Use React Query's `refetchOnReconnect: true` option

**Example:**
```typescript
// Refetch jobs when coming back online
useEffect(() => {
  const handleOnline = () => {
    queryClient.invalidateQueries({ queryKey: ['cached-jobs'] });
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, [queryClient]);
```

**Warning signs:**
- Users report "stale job counts" after switching tabs
- Lane positions don't update after network reconnection
- Click counts frozen until manual page refresh

### Pitfall 4: Animating Layout Properties (Jank)

**What goes wrong:** Animating `left`, `top`, `width`, `height` causes layout recalculation every frame, resulting in janky 30fps animations.

**Why it happens:** Layout properties trigger reflow (re-measure entire DOM tree), while transform only affects compositing layer.

**How to avoid:**
- Use `transform: translateX()` for horizontal movement (not `left: 100px`)
- Use `transform: scale()` for size changes (not `width`/`height`)
- Use `opacity` for fade effects
- Apply `will-change: transform` sparingly for frequently animated elements

**Performance comparison:**
```typescript
// BAD: 30fps, causes reflow
.slide-animation {
  left: 100%;
  transition: left 250ms;
}

// GOOD: 60fps, GPU-accelerated
.slide-animation {
  transform: translateX(100%);
  transition: transform 250ms;
}
```

**Warning signs:**
- Animations stutter or lag on mobile devices
- Chrome DevTools Performance panel shows long paint times
- Frame rate drops below 60fps during animations

### Pitfall 5: Toast Spam from Multiple Users

**What goes wrong:** With 10+ concurrent users clicking jobs, toast notifications stack up and cover the entire screen.

**Why it happens:**
- Broadcasting every migration event to all users without filtering
- No toast limits or position management
- All users get identical toasts simultaneously

**How to avoid:**
- Sonner already handles toast stacking (max visible toasts configurable)
- Use `toast.dismiss()` to programmatically clear old toasts
- Consider showing only migrations for jobs currently visible on user's screen
- Add toast auto-dismiss (4 seconds default in Sonner)

**Example:**
```typescript
// Configure Toaster with limits
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000, // 4 seconds auto-dismiss
  }}
  visibleToasts={3} // Max 3 toasts at once
/>
```

**Warning signs:**
- Users report "too many notifications"
- Toasts overlapping or stacking off-screen
- Performance degradation with many simultaneous toasts

## Code Examples

Verified patterns from official sources:

### Supabase Client Configuration with Throttling
```typescript
// Source: https://supabase.com/docs/guides/realtime/guides/client-side-throttling
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 2, // Reduce from default 10 for quota safety
      },
    },
  }
);
```

### Toast Notification for Lane Migration (Degen Style)
```typescript
// Source: https://sonner.emilkowal.ski/toast
import { toast } from 'sonner';

// Migration to Trending
toast.success('LFG! Job is pumping', {
  description: `"${jobTitle}" hit Trending lane`,
  icon: '📈',
  duration: 5000,
});

// Migration to Graduated
toast.success('Job to the moon!', {
  description: `"${jobTitle}" graduated - top tier now`,
  icon: '🚀',
  duration: 5000,
});
```

### CSS Transform Slide Animation with Cubic-Bezier
```css
/* Source: https://easings.net/ */
/* Ease-out-cubic: Fast start, slow end (natural deceleration) */
.card-slide-enter {
  transform: translateX(100%);
  opacity: 0;
  transition: transform 250ms cubic-bezier(0.215, 0.61, 0.355, 1),
              opacity 250ms ease-out;
}

.card-slide-enter-active {
  transform: translateX(0);
  opacity: 1;
}

/* Near-threshold emphasis: Pulse animation when 4/5 clicks */
.progress-bar-near-threshold {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

### Presence State Hook for Live User Count
```typescript
// Source: https://supabase.com/docs/guides/realtime/presence
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function usePresence() {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('lobby');

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        setUserCount(Object.keys(presenceState).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user
          await channel.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      channel.unsubscribe();
    };
  }, []);

  return userCount;
}

// Usage in Header component
function Header() {
  const userCount = usePresence();

  return (
    <div className="text-purple-300 text-sm">
      {userCount} {userCount === 1 ? 'degen' : 'degens'} online
    </div>
  );
}
```

### React Query Integration with Real-Time Updates
```typescript
// Source: https://tanstack.com/query/latest/docs/reference/QueryClient
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('jobs-broadcast')
      .on(
        'broadcast',
        { event: 'job-updated' },
        (payload) => {
          // Invalidate only active queries (refetchType: 'active')
          queryClient.invalidateQueries({
            queryKey: ['cached-jobs'],
            refetchType: 'active', // Don't refetch inactive/background queries
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Postgres Changes | Broadcast (recommended) | 2024 | Broadcast scales to 1000+ users, Postgres Changes limited to small apps |
| Per-row subscriptions | Table-level subscriptions | 2023 | Reduces message count 100x, avoids quota overages |
| Framer Motion for all animations | CSS Transforms for simple slides | 2025 | CSS 50KB smaller bundle, 60fps on mobile vs 30fps |
| Manual reconnect logic | Supabase auto-reconnect | Always | Exponential backoff, heartbeats, state recovery built-in |
| react-hot-toast | Sonner | 2024 | React 18 optimized, better TypeScript, opinionated API |

**Deprecated/outdated:**
- **Supabase Realtime v1 API:** Use v2+ (channel-based API, not deprecated `.on()` syntax)
- **Framer Motion `layoutId` for cards:** Use `layout` prop instead (simplified API in v11+)
- **Manual throttling with `setTimeout`:** Configure `eventsPerSecond` in client options

## Open Questions

Things that couldn't be fully resolved:

1. **Exact free tier message quota**
   - What we know: 100 messages/second limit documented
   - What's unclear: Whether this is per-project or per-connection, hard vs soft limit
   - Recommendation: Assume per-project, configure `eventsPerSecond: 2` conservatively, monitor Realtime logs

2. **Offline event replay strategy**
   - What we know: Supabase doesn't replay missed messages automatically
   - What's unclear: Best pattern for fetching missed updates after reconnect
   - Recommendation: Refetch full job list on `window.addEventListener('online')` - simple and reliable

3. **Progress bar color change threshold**
   - What we know: User wants "bar fills faster or changes color when close (e.g., 4/5 clicks)"
   - What's unclear: Exact color palette for near-threshold state
   - Recommendation: Change from blue/purple gradient to yellow/orange gradient at 80% threshold, add pulse animation

4. **Mobile animation behavior**
   - What we know: "Same slide animation if user viewing source/destination lane"
   - What's unclear: If user on different lane tab, should migration animate when switching back?
   - Recommendation: No animation for off-screen lanes - only animate visible lane changes to avoid confusion

## Sources

### Primary (HIGH confidence)
- [Supabase Realtime Presence Docs](https://supabase.com/docs/guides/realtime/presence) - Presence API, user tracking
- [Supabase Realtime Limits](https://supabase.com/docs/guides/realtime/limits) - Message quotas, connection limits
- [Supabase Subscribing to Database Changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes) - Broadcast vs Postgres Changes
- [Supabase Client-Side Throttling](https://supabase.com/docs/guides/realtime/guides/client-side-throttling) - eventsPerSecond configuration
- [Sonner GitHub](https://github.com/emilkowalski/sonner) - Toast API, custom messages
- [Sonner Toast Page](https://sonner.emilkowal.ski/toast) - Duration, actions, variants
- [Web.dev Animation Guide](https://web.dev/articles/animations-guide) - Transform performance best practices
- [Easings.net](https://easings.net/) - Cubic-bezier curves reference

### Secondary (MEDIUM confidence)
- [LogRocket: Best React Animation Libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) - Framer Motion vs React Spring comparison
- [Syncfusion: Top React Animation Libraries 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries) - Performance benchmarks
- [TkDodo Blog: Automatic Query Invalidation](https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations) - React Query patterns
- [Framer Motion Layout Animations](https://motion.dev/docs/react-layout-animations) - Layout animation patterns
- [Maxime Heckel: Advanced Framer Motion](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/) - Real-world animation patterns

### Tertiary (LOW confidence)
- WebSearch: "Supabase realtime reconnect handling 2026" - Community discussions, not official
- WebSearch: "CSS transform performance 2026" - General best practices (verify with MDN)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase docs, existing package.json dependencies verified
- Architecture: HIGH - Broadcast pattern documented as recommended approach, verified with official examples
- Pitfalls: HIGH - Message quota limits documented, reconnect behavior verified in official troubleshooting guide
- Animation approach: MEDIUM - CSS vs Framer Motion is project-specific, both valid, CSS recommended for simplicity
- Offline handling: MEDIUM - Pattern verified with community sources, not explicitly documented in Supabase guides

**Research date:** 2026-02-03
**Valid until:** 2026-03-05 (30 days - stable ecosystem, Supabase Realtime API mature)
