# LinkedInScope

## What This Is

A community-driven job aggregator for service industry roles (McDonald's, Subway, retail, etc.) where job listings migrate through a Kanban pipeline based on collective user engagement. Instead of a static job board, listings "graduate" through columns as real users click Quick Apply — essentially crowdsourcing quality signals to surface the most viable opportunities.

## Core Value

Jobs that get engagement are worth applying to. The collective action of users clicking Quick Apply filters out dead-end listings and surfaces active, real opportunities.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can sign up and log in (required for Quick Apply)
- [ ] Jobs display in 3-column Kanban: New → Trending → Graduated
- [ ] User can Quick Apply (redirects to original posting, tracks click)
- [ ] Jobs migrate to Trending at ~10-15 clicks
- [ ] Jobs graduate at ~20-30 clicks (double threshold)
- [ ] Jobs expire after 24 hours if not graduated
- [ ] Each column has a max display limit
- [ ] Job cards show location, title, company
- [ ] Smooth animations when cards move between columns
- [ ] Global feed (all users see same jobs)

### Out of Scope

- Real-time WebSocket updates — refresh/polling is fine for MVP
- Complex location filtering — global feed with location on card
- In-app applications — redirect model only
- Automated scraping (v1) — figure out data source separately

## Context

**Target users:** Service industry job seekers looking for entry-level/minimum wage roles. These jobs move fast and often have simple application processes.

**Why this approach:** Traditional job boards are static and filled with stale/fake listings. By requiring engagement to "promote" a listing, the community naturally filters quality.

**Data source:** TBD — need to research options. Service industry jobs are often on Snagajob, Indeed, company career pages. May start with manual submission or simple scraping as MVP, then expand.

**Project timeline:** Ship fast — this is a working prototype, not a long-term platform.

## Constraints

- **Tech stack**: Next.js frontend, Supabase backend — already decided
- **Animations**: Framer Motion for card transitions
- **Complexity**: Keep it simple — favor shipping over perfection
- **Auth**: Required for Quick Apply to prevent gaming

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Redirect-based Quick Apply | Simpler than in-app applications, still tracks engagement | — Pending |
| Auth required for clicks | Prevents spam/gaming, enables per-user tracking | — Pending |
| 24hr expiry for non-graduated | Service jobs move fast, keeps board fresh | — Pending |
| Global feed over location filtering | Simpler for MVP, location shown on card | — Pending |
| Polling over WebSocket | Simpler real-time, good enough for MVP | — Pending |

---
*Last updated: 2026-02-02 after initialization*
