# Roadmap: LinkedInScope

## Overview

LinkedInScope delivers a community-driven job board where engagement determines visibility. Starting with Phantom wallet authentication and JSearch API integration (Phase 1), we build click tracking and the three-lane Kanban interface (Phase 2), then add real-time lane migrations and playful animations that make jobs visibly move when thresholds are hit (Phase 3). The result: a job board where the community filters quality through action, not algorithms.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Auth** - Setup project, connect Phantom wallet, display jobs from JSearch API
- [ ] **Phase 2: Engagement Core** - Build click tracking, Kanban board, and automatic lane migration logic
- [ ] **Phase 3: Real-Time & Polish** - Add live updates across users and playful animations for card movement

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Users can connect with Phantom wallet and view service-industry job listings
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, JOBS-01, JOBS-02, JOBS-03, SYNC-01, SYNC-02
**Success Criteria** (what must be TRUE):
  1. User can connect Phantom wallet to sign up and login
  2. User session persists across browser refresh without re-authentication
  3. User can view job cards displaying title, company, location, and pay
  4. User can click Quick Apply to redirect to original job posting
  5. System fetches and displays service-industry jobs from JSearch API
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Project setup + Phantom wallet auth with session persistence
- [x] 01-02-PLAN.md — JSearch API integration + job card display with Quick Apply

### Phase 2: Engagement Core
**Goal**: Jobs automatically migrate between lanes based on community click engagement
**Depends on**: Phase 1
**Requirements**: KANB-01, KANB-02, SYNC-01, SYNC-02
**Success Criteria** (what must be TRUE):
  1. User can see jobs organized in three lanes (New Listings, Trending, Graduated)
  2. System tracks Quick Apply clicks per job accurately
  3. Jobs automatically move from New → Trending at 5 clicks
  4. Jobs automatically move from Trending → Graduated at 20 clicks
  5. Lane thresholds are configurable without code changes
**Plans**: TBD

Plans:
- [ ] 02-01: TBD during planning
- [ ] 02-02: TBD during planning

### Phase 3: Real-Time & Polish
**Goal**: All users see lane migrations in real-time with playful animations
**Depends on**: Phase 2
**Requirements**: KANB-03, KANB-04
**Success Criteria** (what must be TRUE):
  1. When a job migrates lanes, all connected users see the update within 2 seconds
  2. Cards visibly animate when moving between lanes (slide/fade transitions)
  3. Lane migrations feel playful and energetic (degenerate style)
  4. Real-time updates work reliably with 10+ concurrent users
**Plans**: TBD

Plans:
- [ ] 03-01: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 2/2 | Complete | 2026-02-02 |
| 2. Engagement Core | 0/2 | Not started | - |
| 3. Real-Time & Polish | 0/1 | Not started | - |

---
*Roadmap created: 2026-02-02*
*Last updated: 2026-02-02 after Phase 1 completion*
