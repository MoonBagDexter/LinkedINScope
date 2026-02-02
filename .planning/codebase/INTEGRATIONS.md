# External Integrations

**Analysis Date:** 2026-02-02

## APIs & External Services

**Government Data Sources:**
- justice.gov - DOJ Epstein Files disclosure repository
  - What it's used for: Direct links to declassified PDF documents, video footage, audio interviews
  - Integration type: Static URL links (no SDK/API client)
  - Usage: All documents in `C:\Users\thedi\Desktop\epsteindrop\app\page.js` RELEASES data structure link directly to justice.gov URLs

**Media Delivery:**
- Google Docs Viewer - Embedded PDF preview capability
  - What it's used for: Inline PDF viewing (mentioned in README as feature)
  - Integration type: HTML iframe or link-based
  - How implemented: Document browser clicks open PDFs via Google Docs or direct links

## Data Storage

**Database:**
- None detected - Application is fully static

**File Storage:**
- Static documents: Hosted externally on justice.gov
- Application static files: Served by Next.js from public directory
- No database backend

**Caching:**
- None explicitly configured
- Next.js default caching behavior applies:
  - Static pages cached automatically
  - Dynamic content re-generated per request

## Authentication & Identity

**Auth Provider:**
- None - Application is fully public, read-only archive
- No user accounts, login, or authentication required

## Monitoring & Observability

**Error Tracking:**
- None detected - No error tracking service (Sentry, etc.) configured

**Logs:**
- Default Next.js logging only
- No custom logging framework

**Analytics:**
- Not implemented currently
- README mentions potential future addition: "Add OG image for social sharing" and "Analytics (Vercel Analytics or Plausible)"

## CI/CD & Deployment

**Hosting:**
- Recommended: Vercel (mentioned in README)
- Alternative: Any Node.js hosting (Heroku, AWS, DigitalOcean, etc.)
- Static export option: Can be configured in `next.config.js` for static hosting

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or other CI config present
- Deployment model: Manual deploy or via Vercel GitHub integration

## Environment Configuration

**Required env vars:**
- None - Application uses no environment variables
- All configuration is static in `C:\Users\thedi\Desktop\epsteindrop\app\page.js`

**Secrets location:**
- Not applicable - No secrets required

## External Resources

**Third-Party Libraries:**
- Google Fonts API - IBM Plex Mono and Space Grotesk fonts
  - Served via: `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap`
  - Located in: `C:\Users\thedi\Desktop\epsteindrop\app\layout.js` (lines 22-24)
  - Preconnect hints for performance: `https://fonts.googleapis.com` and `https://fonts.gstatic.com`

## Webhooks & Callbacks

**Incoming:**
- None - Application does not receive webhooks

**Outgoing:**
- None - Application does not send webhooks or push data anywhere

## Content Integration

**Static Content:**
- Document metadata hardcoded in `RELEASES` object
- Document URLs directly to justice.gov endpoints
- No CMS or content management system

**Media Integration:**
- Audio files: Direct links to `.wav` files on justice.gov CDN
- Video files: Direct links to `.mp4` files on justice.gov CDN
- PDF documents: Direct links to `.pdf` files on justice.gov

## Notes

**Zero External Dependencies:**
- This application has no external API calls, database connections, or third-party service integrations
- All content is static and served locally
- Links to external resources are just HTML href attributes, not API integrations
- Application is completely offline-capable except for Google Fonts (which could be self-hosted)

---

*Integration audit: 2026-02-02*
