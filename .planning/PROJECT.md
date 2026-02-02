# LinkedInScope

## What This Is

A community-driven job aggregator and "migration engine" for service-industry roles (fast food, retail, hospitality). Jobs are automatically sourced and displayed on a gamified Kanban board where collective user engagement determines which listings are worth pursuing. Think "Product Hunt for minimum wage jobs" — the community filters quality through action.

## Core Value

**Jobs surface based on real engagement, not algorithms.** When users click Quick Apply, they vote with intent — and the best opportunities rise automatically.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Kanban board with 3 lanes: New Listings, Trending, Graduated
- [ ] Automated job sourcing via JSearch API (service-industry roles)
- [ ] Quick Apply button that redirects to original posting and tracks click
- [ ] Click thresholds trigger automatic lane migration
- [ ] Phantom wallet authentication (Web3-native, no traditional auth)
- [ ] Real-time updates when jobs migrate between lanes
- [ ] Playful "degenerate" animations for card movement

### Out of Scope

- User profiles with application history — keep it simple, auth is just for spam prevention
- Manual job submissions — all content is automated
- Apply-through-platform — we redirect, don't handle applications
- Mobile app — web-first, Vercel deployment

## Context

**Target users:** High-volume job seekers in service industry looking for quick, verified leads. People applying to 20+ jobs/day who want the community to pre-filter.

**Job source:** JSearch API via RapidAPI aggregates Indeed, LinkedIn, Glassdoor. 500 free requests/month on free tier. Focus on: McDonald's, Subway, Walmart, Target, retail, food service, hospitality.

**Engagement thresholds (initial):**
- New → Trending: 5 Quick Apply clicks
- Trending → Graduated: 20 Quick Apply clicks
- These are tunable and should be configurable.

**Animation style:** "Degenerate" — playful, chaotic, high-energy. Cards should visibly slide between columns when thresholds are hit.

## Constraints

- **Tech stack**: Next.js 14+ (App Router), Supabase (auth + database + realtime), Framer Motion (animations)
- **Deployment**: Vercel
- **API limits**: JSearch free tier = 500 requests/month. Need to cache aggressively or batch fetch jobs on schedule.
- **Legal**: No direct scraping of job boards. Use official APIs only.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| JSearch API for job sourcing | Aggregates multiple boards legally, has free tier, includes service-industry roles | — Pending |
| Supabase for backend | Provides auth, database, and realtime subscriptions in one package. Good DX with Next.js | — Pending |
| Redirect model (not apply-through) | Simpler to build, avoids legal issues with collecting applicant data | — Pending |
| Phantom wallet only | Web3-native auth, Phantom provides friction barrier against spam, crypto-native audience | — Pending |

---
*Last updated: 2026-02-02 after initialization*
