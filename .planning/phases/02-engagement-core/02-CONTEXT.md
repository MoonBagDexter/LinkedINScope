# Phase 2: Engagement Core - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the click tracking system and three-lane Kanban board where jobs automatically migrate between lanes (New Listings → Trending → Graduated) based on community engagement thresholds. This phase captures clicks, displays jobs in lanes, and implements automatic migration logic.

</domain>

<decisions>
## Implementation Decisions

### Board Layout & Card Display
- **Desktop:** Three equal columns side-by-side (classic Kanban)
- **Mobile:** Show one lane at a time with tabs at top (New / Trending / Graduated) to switch
- **Lane headers:** Simple text labels (New Listings, Trending, Graduated) - no emojis or counts
- **Card content:** Keep Phase 1 design (title, company, location, pay) + add progress bar showing progress toward next threshold
- **Progress bar:** Visual indicator showing clicks progress (e.g., 3/5 to Trending, 8/20 to Graduated)

### Click Tracking Mechanics
- **Anti-gaming:** One click per wallet per job (wallets can only contribute once per job, ever)
- **Tracking trigger:** Click recorded only if user actually visits external job page (not just button click)
- **User history:** Show "Already applied" badge on cards user has clicked
- **Storage:** Supabase database (jobs table + clicks table with wallet_address, job_id, timestamp)

### Lane Migration Behavior
- **Visual behavior:** Card instantly disappears from old lane and appears in new lane
- **During detail view:** If user viewing job when it migrates, show notification "This job just moved to Trending!"
- **Migration timing:** Immediately after each click is recorded, check if threshold crossed and migrate
- **Direction:** One-way progression only (New → Trending → Graduated), no backwards movement

### Threshold Configuration
- **Storage location:** Environment variables in .env file (THRESHOLD_NEW_TO_TRENDING=5, THRESHOLD_TRENDING_TO_GRADUATED=20)
- **Runtime adjustment:** Not needed - .env changes and redeploy acceptable for now
- **User visibility:** Thresholds hidden from users (they see progress bars but not exact numbers)
- **Uniformity:** Same thresholds for all jobs (no per-category thresholds)

### Claude's Discretion
- Exact progress bar visual design and styling
- Lane column widths and responsive breakpoints
- Database schema details (indexes, constraints)
- Error handling for failed click tracking
- Loading states while fetching lane data

</decisions>

<specifics>
## Specific Ideas

No specific requirements - open to standard approaches within the decisions above.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 02-engagement-core*
*Context gathered: 2026-02-02*
