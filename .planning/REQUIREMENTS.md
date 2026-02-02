# Requirements: LinkedInScope

**Defined:** 2026-02-02
**Core Value:** Jobs surface based on real engagement, not algorithms

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can connect Phantom wallet to sign up/login
- [ ] **AUTH-02**: User session persists across browser refresh

### Job Display

- [ ] **JOBS-01**: User can view job listing cards with title, company, location, pay
- [ ] **JOBS-02**: User can click Quick Apply to redirect to original posting
- [ ] **JOBS-03**: System tracks Quick Apply clicks per job

### Kanban Board

- [ ] **KANB-01**: Jobs display in three-lane Kanban (New, Trending, Graduated)
- [ ] **KANB-02**: Jobs automatically migrate lanes when click thresholds are reached
- [ ] **KANB-03**: Lane migrations update in real-time for all users
- [ ] **KANB-04**: Cards animate when moving between lanes

### Job Sourcing

- [ ] **SYNC-01**: System auto-syncs service-industry jobs from JSearch API
- [ ] **SYNC-02**: Jobs cache for 24+ hours to conserve API quota

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Discovery Enhancement

- **DISC-01**: User can search jobs by location
- **DISC-02**: User can filter jobs by job type and pay range
- **DISC-03**: User can save/bookmark jobs for later

### Anti-Gaming

- **GAME-01**: System limits click velocity (max 50/hour per user)
- **GAME-02**: System validates engagement signals (time-on-page, scroll depth)
- **GAME-03**: System tracks user trust scores based on behavior patterns

### Additional Auth

- **AUTH-03**: User can sign up with email/password
- **AUTH-04**: User can sign in with Google OAuth

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Resume hosting | Scope creep, maintenance burden, privacy liability |
| In-platform messaging | Spam risk, moderation nightmare |
| AI job matching | Undermines core differentiator (community beats algorithms) |
| Employer posting portal | Two-sided marketplace complexity |
| Complex gamification (badges/leaderboards) | Can feel manipulative, adds stress |
| Social features (comments/follows) | Moderation burden, dilutes focus |
| Privacy consent banner | User opted out — relying on Phantom as friction barrier |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| JOBS-01 | Phase 1 | Complete |
| JOBS-02 | Phase 1 | Complete |
| JOBS-03 | Phase 1 | Complete |
| SYNC-01 | Phase 1 | Complete |
| SYNC-02 | Phase 1 | Complete |
| KANB-01 | Phase 2 | Complete |
| KANB-02 | Phase 2 | Complete |
| KANB-03 | Phase 3 | Pending |
| KANB-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11 (100% coverage)
- Unmapped: 0

---
*Requirements defined: 2026-02-02*
*Last updated: 2026-02-02 after Phase 1 completion*
