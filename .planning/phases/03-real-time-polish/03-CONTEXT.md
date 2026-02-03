# Phase 3: Real-Time & Polish - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Real-time lane migration visibility and playful card animations across all connected users. When one user's click causes a job to migrate lanes (5 clicks → Trending, 20 clicks → Graduated), all other connected users see it happen with animated transitions. This phase makes the existing three-lane migration system feel alive and energetic.

NOT in scope: filtering, search, additional lanes, commenting, or new features - this is purely about making existing migrations visible and celebratory.

</domain>

<decisions>
## Implementation Decisions

### Animation style & personality
- Quick slide animation (200-300ms) - smooth horizontal movement with easing curve
- Progress bar emphasis near threshold - bar fills faster or changes color when close (e.g., 4/5 clicks)
- Mobile (tabbed lanes): Same slide animation if user viewing source/destination lane
- Fast, snappy movement that's visible but doesn't slow down the experience

### Real-time update timing
- Clicking user: Wait for database confirmation before showing migration (no optimistic updates)
- Other users: See migrations within 2 seconds (slight batching/debouncing for quota efficiency)
- Click count updates: Batched every 2-5 seconds and synced as a group (not every individual click)
- Offline handling: Fetch fresh state silently on reconnect (no jarring catch-up animations)

### Visual feedback & celebration
- Toast notification only for migrations (both Trending and Graduated) - no confetti or particle effects
- Same celebration intensity for both migration types (5→Trending and 20→Graduated)
- All users see same toast/animation - passive viewers get full celebration experience
- Toast personality: Crypto/degen slang style - "LFG! Job is pumping 📈" or "Job to the moon!" - on-brand chaos

### Multi-user awareness
- Live user count displayed in top-right header (e.g., "7 degens online")
- Live click count updates visible to all users (using batched sync from timing decisions)
- No click attribution - users see progress bars update but don't know who clicked (anonymous engagement)
- Focus stays on jobs and community activity, not individual identity

### Claude's Discretion
- Exact easing curve for slide animation
- Progress bar color/style changes near threshold
- Supabase real-time subscription setup and message optimization
- Toast auto-dismiss timing
- User count update frequency
- Exact wording variations for degen-style toast messages

</decisions>

<specifics>
## Specific Ideas

- Toast examples: "LFG! Job is pumping 📈", "Job to the moon!", "This one's heating up 🔥"
- User count format: "X degens online" (not "users" or "people")
- Fast animations that match the energetic, degenerate vibe - nothing slow or corporate
- Real-time feel without spamming Supabase quota - batching is intentional design choice

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 03-real-time-polish*
*Context gathered: 2026-02-03*
