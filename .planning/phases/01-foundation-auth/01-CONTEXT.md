# Phase 1: Foundation & Auth - Context

**Gathered:** 2026-02-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Users connect with Phantom wallet and view fast-food/quick-service job listings from JSearch API. This phase delivers authentication, session persistence, and job card display. Click tracking and Kanban lanes are Phase 2.

**The vibe:** "Solana nuked, time to flip burgers" — a meme-forward job board for degens who need to touch grass and make rent.

</domain>

<decisions>
## Implementation Decisions

### Job Card Design
- Minimal info per card: title, company, location, pay — just enough to decide to click
- Bold/degen visual style: high contrast, vibrant accents, crypto-native aesthetic
- Medium list layout: full-width cards stacked vertically, ~6-8 visible on screen
- Quick Apply as primary CTA: bold, prominent button that stands out on each card

### Job Listing Scope
- US-centered jobs only — no location filter needed
- Target fast-food and quick-service restaurants: McDonald's, Subway, Taco Bell, Wendy's, Chick-fil-A, etc.
- No pay range filter — it's fast food, the range is known
- Search terms should target: fast food, quick service, restaurant crew, team member

### Claude's Discretion
- Initial job count and pagination strategy (considering JSearch API quota limits)
- Exact color palette and typography for degen aesthetic
- Auth flow UX details (button placement, connect/disconnect states)
- Empty and loading state designs

</decisions>

<specifics>
## Specific Ideas

- "Solana is nuking, you're gonna have to get a job" — the whole premise is meme-forward
- Jobs should feel like a reality check presented with humor
- The degen aesthetic should match crypto culture (bold, irreverent, high-energy)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-auth*
*Context gathered: 2026-02-02*
