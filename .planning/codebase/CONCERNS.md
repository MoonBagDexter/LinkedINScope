# Codebase Concerns

**Analysis Date:** 2026-02-02

## Tech Debt

**Monolithic page component:**
- Issue: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` contains 1382 lines of all UI logic, including document cards, media players, sections, timeline, and PDF viewer
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js`, `C:\Users\thedi\Desktop\epsteindrop\app.jsx` (946 lines, appears to be legacy)
- Impact: Component becomes difficult to maintain, test, and reason about. Changes to one feature risk breaking others. Code reuse is problematic.
- Fix approach: Extract components (DocumentCard, MediaCard, Section, Timeline, PDFViewer) into separate files in `C:\Users\thedi\Desktop\epsteindrop\app\components\`. Each should be ~50-200 lines.

**Duplicate data structure (RELEASES):**
- Issue: `RELEASES` object with document URLs and metadata is defined in both `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 15-112) and `C:\Users\thedi\Desktop\epsteindrop\app.jsx` (lines 15-112)
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js`, `C:\Users\thedi\Desktop\epsteindrop\app.jsx`
- Impact: Data maintenance nightmare - updates must be made in two places. Risk of inconsistency between old and new versions.
- Fix approach: Move `RELEASES` and `TIMELINE` to a single data file: `C:\Users\thedi\Desktop\epsteindrop\app\data\releases.js` and import in both components. Eventually retire the legacy `app.jsx` file entirely.

**Inline styles everywhere:**
- Issue: All styling is inline JavaScript objects instead of CSS classes
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (extensive inline styles), component files using style objects
- Impact: CSS cannot be cached, large JavaScript bundle size, no ability to use CSS media queries for responsive design, performance degradation, difficult to maintain consistent spacing/colors
- Fix approach: Move common style patterns to CSS module or BEM classes in `C:\Users\thedi\Desktop\epsteindrop\app\styles\`. Create reusable style variables/classes for:
  - Card components (`card`, `card--dark`, `card--hover`)
  - Text styles (`mono`, `heading`, `tag`)
  - Layout utilities (`flex`, `grid`, `section`)

**Manual event listener management:**
- Issue: Keyboard event listeners added/removed in multiple components with manual cleanup
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 988-992), `C:\Users\thedi\Desktop\epsteindrop\app\components\AudioPlayer.jsx` (lines 32-40)
- Impact: Risk of memory leaks if cleanup fails. Difficult to debug event conflicts. No centralized keyboard handling.
- Fix approach: Create a custom hook `useKeyboardListener()` in `C:\Users\thedi\Desktop\epsteindrop\app\hooks\useKeyboardListener.js` that handles registration, cleanup, and prevents duplicate listeners.

**No URL configuration management:**
- Issue: All external URLs (DOJ justice.gov links) hardcoded in data structures
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 24-110)
- Impact: Cannot quickly swap to staging/test servers. Domain changes require code edits. No fallback handling for unreachable URLs.
- Fix approach: Create `C:\Users\thedi\Desktop\epsteindrop\app\config\urls.js` with BASE_URL and helper functions. Add environment variables support.

## Known Bugs

**PDF viewer uses Google Docs fallback:**
- Symptoms: PDFs won't load if Google Docs viewer is down or blocks requests. Cross-origin issues possible.
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (line 744)
- Code: `const pdfViewerUrl = \`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(doc.url)}\``
- Trigger: Click any PDF document link, try to view PDF in modal
- Workaround: Use "OPEN DIRECT" button to bypass viewer. Consider implementing local PDF rendering with pdfjs-dist package.

**Volume slider on iOS/Safari:**
- Symptoms: Volume control input styling doesn't match design on Safari. Appears as system slider instead of custom styled range input.
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (line 421)
- Cause: WebKit doesn't support full styling of input[type="range"]
- Trigger: Open audio player on iPhone/Safari
- Workaround: None currently. User can still adjust volume using system controls.

**Video progress bar click calculation:**
- Symptoms: Clicking far left/right of progress bar may seek to inaccurate position
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 298-302)
- Code: Doesn't account for element padding or scrolling offset
- Trigger: Click progress bar on video player
- Fix approach: Use getBoundingClientRect() for accurate positioning calculation.

**Missing error boundaries:**
- Symptoms: Single component crash will unmount entire page. No graceful degradation.
- Files: All component files
- Cause: No React Error Boundary components implemented
- Trigger: Broken external URL, failed resource load, state corruption
- Fix approach: Add Error Boundary wrapper in `C:\Users\thedi\Desktop\epsteindrop\app\components\ErrorBoundary.jsx` that catches and displays fallback UI.

## Security Considerations

**Sensitive URLs directly in source:**
- Risk: justice.gov URLs containing document identifiers are visible in source code/repository
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 13-110)
- Current mitigation: None - URLs are public anyway (from justice.gov)
- Recommendations: No immediate fix needed since URLs are public. However, for any future private data, use environment variables + server-side URL mapping.

**No content security policy:**
- Risk: Inline styles and `eval()`-like patterns could be vulnerable to XSS
- Files: All components using inline styles, Google Docs iframe
- Current mitigation: No CSP headers configured
- Recommendations: Add CSP headers in `next.config.js`:
```javascript
headers() {
  return [{
    source: '/(.*)',
    headers: [{
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src * data:; font-src 'self';"
    }]
  }]
}
```

**Missing rel="noopener noreferrer" on some links:**
- Risk: External links to third-party sites could exploit window.opener
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` - check all external links
- Current mitigation: Most links have it, but not all systematically verified
- Recommendations: Audit all `<a>` tags with `target="_blank"` and add `rel="noopener noreferrer"` consistently.

**Unvalidated iframe source:**
- Risk: iframe source (Google Docs viewer, Mozilla PDF.js) could be manipulated if URLs are ever user-controlled
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (line 884)
- Current mitigation: URLs are hardcoded from verified sources only
- Recommendations: If ever user-submitted URLs are added, whitelist domains and validate with URL constructor.

## Performance Bottlenecks

**Large bundle from inline styles:**
- Problem: All styling in JavaScript increases initial bundle size and parse time
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (~1382 lines of style objects)
- Cause: Style objects in every component prevent CSS extraction and bundler optimization
- Improvement path: Extract to CSS modules/classes. Target 20-30% JavaScript reduction.

**Duplicate component definitions across app.jsx and page.js:**
- Problem: Two entry points with same components means downloading duplicate code
- Files: `C:\Users\thedi\Desktop\epsteindrop\app.jsx` (946 lines), `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (1382 lines)
- Cause: Legacy code not removed after migration
- Current impact: ~2.3KB extra gzipped per load (estimated)
- Improvement path: Delete `app.jsx` completely, consolidate to single `page.js`

**No lazy loading for media:**
- Problem: All video/audio links load immediately when page renders
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 680-730)
- Cause: Maps render MediaCard for each audio/video without lazy evaluation
- Impact: Unnecessary DOM nodes, metadata requests on non-visible media
- Improvement path: Use Intersection Observer API in MediaCard to defer rendering until visible.

**Fixed z-index stacking context:**
- Problem: Multiple fixed-position overlay elements with very high z-indexes (9999, 10000)
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\components\ScreenEffects.jsx` (lines 32, 62), PDFViewer (line 755)
- Cause: z-index values set independently without coordination
- Impact: Stacking order bugs with modals, potential visual glitches
- Improvement path: Create `z-index.js` constants:
```javascript
export const ZINDEX = {
  SCANLINES: 9997,
  VIGNETTE: 9998,
  FLICKER: 9999,
  MODAL: 10000,
}
```

**No code splitting or dynamic imports (except ScreenEffects):**
- Problem: All components load upfront, even if not immediately visible
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js`
- Cause: Direct imports instead of dynamic imports
- Impact: Higher initial page load time
- Improvement path: Move below-fold sections to dynamic imports using `next/dynamic`.

**Frequent state updates in audio/video players:**
- Problem: `timeupdate` event fires ~60x per second, causing state updates
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 273-275), `C:\Users\thedi\Desktop\epsteindrop\app\components\AudioPlayer.jsx` (lines 23-25)
- Cause: Listening to native timeupdate without throttling
- Impact: Unnecessary re-renders, potential battery drain on mobile
- Improvement path: Throttle update frequency to 10-30fps or use requestAnimationFrame.

## Fragile Areas

**PDF viewer modal:**
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 737-896)
- Why fragile: Depends on external Google Docs viewer service. Hardcoded iframe approach breaks if service unavishes/changes API. No fallback.
- Safe modification: Before changing PDF rendering, implement local PDF rendering option using pdfjs-dist package. Test with various PDF formats.
- Test coverage: No tests exist for PDF loading/rendering failures.

**Media card expanded state:**
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 444-601 - MediaCard component)
- Why fragile: Local expanded state in individual cards. Clicking one expands it, but no coordination between multiple cards. Closing one card doesn't signal closing others.
- Safe modification: Refactor to accept expanded state and onToggle callback from parent. Ensure only one media item plays at a time.
- Test coverage: No tests for multi-media expansion scenarios.

**Keyboard escape handler:**
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 988-992)
- Why fragile: Assumes page.js is main component. If modal added elsewhere (like in ChaosController), escape might not propagate correctly.
- Safe modification: Implement global keyboard context provider or use document-level listener in layout.
- Test coverage: No tests for keyboard behavior.

**Audio player cleanup:**
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\components\AudioPlayer.jsx` (lines 14-41)
- Why fragile: Manual event listener cleanup. If component unmounts before cleanup runs, listeners leak.
- Safe modification: Add abort signal pattern to safely unsubscribe from all events atomically.
- Test coverage: No cleanup tests.

**RELEASES data hardcoding:**
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 15-112)
- Why fragile: Any URL typo breaks document display silently. No validation of URLs before rendering.
- Safe modification: Add URL validation function, test all URLs are reachable at build time.
- Test coverage: No data validation tests.

## Scaling Limits

**Single component size:**
- Current capacity: page.js is 1382 lines - maintainable threshold is ~300-400 lines per component
- Limit: Will become unmaintainable with any new document types, filters, or features
- Scaling path: Split into component files immediately. Each page section should be separate component (~100-150 lines).

**Fixed data structure:**
- Current capacity: Supports ~20-30 document entries per release without performance issues
- Limit: If expanding to 100+ documents, need pagination/search/filtering
- Scaling path: Add `limit` and `offset` properties to releases. Implement search in `C:\Users\thedi\Desktop\epsteindrop\app\data\releases.js`. Add filtering UI.

**Hardcoded navigation links:**
- Current capacity: 4 main release sections
- Limit: Adding more releases breaks fixed nav bar layout
- Scaling path: Generate nav from RELEASES object. Make nav responsive/scrollable. Consider mega-menu or dropdown.

**Single media player per type:**
- Current capacity: Only one audio OR one video can play at a time (by design)
- Limit: If adding multiple concurrent audio tracks or playlist feature, current architecture breaks
- Scaling path: Create media context/provider to manage active players globally.

## Dependencies at Risk

**Next.js 14.2.0:**
- Risk: Fairly recent major version. Edge cases possible with App Router.
- Impact: Could break with minor version updates. API changes possible.
- Migration plan: Keep updated to latest 14.x. Monitor breaking changes. Test major upgrades in separate branch.

**Google Docs viewer:**
- Risk: Google could deprecate, change URL format, or block requests
- Impact: PDFs become unviewable in modal. Users must use "Open Direct" button.
- Migration plan: Already commented in code (line 743). Implement local PDF.js rendering as fallback. Add feature flag to switch between viewers.

**React 18.3.0 & Next.js 14.2.0 ESLint rules:**
- Risk: ESLint config is minimal (only next/eslint-config-next). Missing many rules for consistency.
- Impact: Code quality issues slip through. Inconsistent patterns.
- Migration plan: Add eslint-plugin-react-hooks, eslint-plugin-jsx-a11y. Enforce exhaustive-deps.

**Vercel deployment assumption:**
- Risk: Vercel deployment mentioned in README but no deployment configuration in codebase
- Impact: Deployment could fail if environment variables or edge functions needed later
- Migration plan: If deploying elsewhere, may need build script adjustments. Add deployment docs for alternatives.

## Missing Critical Features

**No image optimization:**
- Problem: Inline SVG and base64 data URLs used directly without optimization
- Blocks: Cannot add images to hero without significant file size increase
- Impact: Every user downloads full SVG filter definitions, noise patterns
- Fix: Compress SVGs, use data URI optimization, consider preloading only critical images.

**No search/filter for documents:**
- Problem: All documents always visible on one page
- Blocks: Cannot find specific documents on mobile or with 50+ items
- Impact: User experience degrades as document count increases
- Fix: Add search input and filter by release/type. Implement client-side search with fuse.js or simple string matching.

**No analytics:**
- Problem: No tracking of which documents users click, watch, or download
- Blocks: Cannot understand user behavior or popular documents
- Impact: Lost insights into what content resonates
- Fix: Add Vercel Analytics (recommended) or Plausible. Track document clicks, video plays, PDF views.

**No download tracking/verification:**
- Problem: Cannot verify users successfully downloaded files
- Blocks: No way to confirm file integrity or track distribution
- Impact: Unknown if large files fail to download silently
- Fix: Add integrity hashes to document metadata. Track download events. Consider server-side download proxy for better logging.

**No offline support:**
- Problem: Site requires internet to display documents
- Blocks: Cannot view when offline or during connectivity issues
- Impact: Poor experience on slow connections
- Fix: Add service worker with offline fallback. Cache document metadata locally. Consider PDF caching for frequently accessed docs.

**No error logging/monitoring:**
- Problem: When network requests fail (DOJ URLs down), users see nothing
- Blocks: Cannot debug production issues or alert on broken links
- Impact: Users think site is broken when it's actually network issue
- Fix: Add error logging (Sentry recommended). Add retry logic with exponential backoff. Display user-friendly error messages.

## Test Coverage Gaps

**No component tests:**
- What's not tested: DocumentCard click behavior, MediaCard expansion, PDFViewer modal lifecycle
- Files: All component files in `C:\Users\thedi\Desktop\epsteindrop\app\page.js`, `C:\Users\thedi\Desktop\epsteindrop\app\components\`
- Risk: Changes to card structure break without detection. Modal doesn't close properly when ESC pressed.
- Priority: High - these are user interaction points

**No audio/video player tests:**
- What's not tested: Play/pause, progress seeking, volume control, time formatting
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (VideoPlayer lines 257-441), `C:\Users\thedi\Desktop\epsteindrop\app\components\AudioPlayer.jsx`
- Risk: Playback bugs slip through. Seeking to wrong timestamp. Volume not persisting.
- Priority: High - core user functionality

**No data validation tests:**
- What's not tested: RELEASES object structure, URL validity, required fields present
- Files: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (lines 15-112)
- Risk: Invalid data causes silent failures. Missing URLs render empty links.
- Priority: Medium - would catch data entry errors

**No accessibility tests:**
- What's not tested: Keyboard navigation, screen reader compatibility, color contrast
- Files: All files
- Risk: Site unusable for assistive technology users. No keyboard access to modals or media controls.
- Priority: Medium-High - legal/usability requirement

**No integration tests:**
- What's not tested: Full page load, navigation between sections, modal open/close workflow
- Files: N/A (no test framework configured)
- Risk: User workflows break without being caught. Page structure changes break navigation.
- Priority: Medium

**No visual regression tests:**
- What's not tested: Layout doesn't shift, effects render correctly, responsive design
- Files: All files
- Risk: CSS changes accidentally break layout. Inline styles conflict. Mobile layout breaks.
- Priority: Low-Medium (can be caught in manual testing)

---

*Concerns audit: 2026-02-02*
