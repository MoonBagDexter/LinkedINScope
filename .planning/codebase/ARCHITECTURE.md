# Architecture

**Analysis Date:** 2026-02-02

## Pattern Overview

**Overall:** Client-side single-page application with document-centric UI

**Key Characteristics:**
- Server-side rendering via Next.js with client-side interactivity
- Data-driven component rendering from static configuration
- Three visual layers: base content, interactive overlays, chaotic effects
- External document links (no backend services)
- Event-driven state management for modal/popup flows

## Layers

**Presentation Layer:**
- Purpose: Render UI components with inline styling and animations
- Location: `C:\Users\thedi\Desktop\epsteindrop\app\`
- Contains: React components, page layouts, CSS animations
- Depends on: React, Next.js, data configuration
- Used by: Browser rendering engine

**Content Data Layer:**
- Purpose: Define document releases, timeline events, media content
- Location: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (RELEASES, TIMELINE objects)
- Contains: Static data structures for documents, audio, videos
- Depends on: Nothing (pure data)
- Used by: Section component, rendering logic

**Configuration Layer:**
- Purpose: Store meme sequences and chaos behavior settings
- Location: `C:\Users\thedi\Desktop\epsteindrop\app\memes\memeConfig.js`
- Contains: MEMES array, CHAOS_CONFIG object, getRandomMeme utility
- Depends on: Nothing (pure configuration)
- Used by: ChaosController, ScrollMeme

**Effects & Animation Layer:**
- Purpose: Global visual effects and decorative overlays
- Location: `C:\Users\thedi\Desktop\epsteindrop\app\components\ScreenEffects.jsx`, `DegenOverlays.jsx`
- Contains: Dynamic visual distortions, screen artifacts
- Depends on: CSS animations, React state
- Used by: Page root layout

**Interactive Controls Layer:**
- Purpose: Handle user interactions for media playback and navigation
- Location: `C:\Users\thedi\Desktop\epsteindrop\app\components\AudioPlayer.jsx`, `VideoPlayer` (in page.js)
- Contains: Play/pause logic, progress tracking, volume control
- Depends on: HTML5 media APIs
- Used by: MediaCard, Section components

## Data Flow

**Page Load:**

1. Layout wrapper loads global styles, fonts, and metadata from `layout.js`
2. Page.js component initializes with RELEASES and TIMELINE data
3. Dynamic components (ScreenEffects, DegenOverlays, ChaosController) load asynchronously
4. Timeline renders with hardcoded event array
5. Section components render for each RELEASES entry
6. ScrollMeme components insert between sections

**Document Selection Flow:**

1. User clicks DocumentCard in Section
2. onDocSelect callback sets selectedDoc state
3. PDFViewer modal appears with iframe pointing to Mozilla PDF.js viewer
4. User can download, open direct, or close with ESC key
5. onClose callback clears selectedDoc

**Media Playback Flow:**

1. User clicks MediaCard (audio or video)
2. onClick sets expanded state to true
3. Appropriate player component (AudioPlayer or VideoPlayer) renders below card
4. Player exposes controls: play/pause, progress, volume
5. onClose callback collapses player, returns to card view

**Chaos Effect Flow:**

1. ChaosController checks if meme files exist
2. After initialDelay (30s), first MemePopup spawns with random meme
3. On popup close, 30% chance to spawn CornerMeme (up to 3 max)
4. If fake close triggered, spawns corner meme instead of closing popup
5. Popup interval escalates down from maxPopupInterval to minPopupInterval over time
6. ESC key closes active popup; Ctrl+Shift+C toggles chaos mode

**State Management:**

- Local component state via useState: visibility, playback, UI modes
- Page-level state: selectedDoc (PDF viewer), loaded (fade-in animation)
- Global state: ChaosController manages activePopup, cornerMemes, shownMemeIds
- No context providers or external state library (Redux, Zustand, etc.)
- All state updates are synchronous and immediate

## Key Abstractions

**Section Component:**
- Purpose: Render a document release grouping with title, description, documents, media
- Examples: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` lines 604-735
- Pattern: Receives release object prop, maps over documents/audio/videos arrays, renders sub-components

**DocumentCard Component:**
- Purpose: Display document metadata and link
- Examples: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` lines 191-255
- Pattern: Inline styled div, hover state, onClick callback to parent

**MediaCard Component:**
- Purpose: Generic container for audio/video with expandable player
- Examples: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` lines 444-601
- Pattern: Conditional rendering - shows card or player based on expanded state

**AudioPlayer Component:**
- Purpose: Standalone audio playback controller
- Examples: `C:\Users\thedi\Desktop\epsteindrop\app\components\AudioPlayer.jsx`
- Pattern: useRef for audio element, useState for playback metrics, event listeners on mount

**PDFViewer Component:**
- Purpose: Full-screen modal for document viewing
- Examples: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` lines 738-896
- Pattern: Fixed positioning overlay, iframe with Mozilla PDF.js viewer, header with actions

**ChaosController Component:**
- Purpose: Orchestrate popup and corner meme spawning logic
- Examples: `C:\Users\thedi\Desktop\epsteindrop\app\components\ChaosController.jsx`
- Pattern: Multiple useEffect hooks for timers, event listeners, async meme availability check

## Entry Points

**Root Page:**
- Location: `C:\Users\thedi\Desktop\epsteindrop\app\layout.js`
- Triggers: Initial page load
- Responsibilities: Define HTML structure, import global styles, set metadata tags

**Main Page Component:**
- Location: `C:\Users\thedi\Desktop\epsteindrop\app\page.js`
- Triggers: Route to `/` (home)
- Responsibilities: Render header, navigation, timeline, all sections, footer; manage PDF viewer state

**Dynamically Imported Components:**
- ScreenEffects: Loaded via dynamic import with ssr: false
- DegenOverlays: Loaded via dynamic import with ssr: false
- ChaosController: Loaded via dynamic import with ssr: false
- ScrollMeme: Loaded via dynamic import with ssr: false
- Purpose: Reduce initial bundle size, offload heavy animations to client

## Error Handling

**Strategy:** Graceful degradation - optional features degrade silently if resources unavailable

**Patterns:**
- ChaosController checks meme file availability with fetch HEAD request; renders nothing if unavailable
- AudioPlayer catches audio.play() exceptions (e.g., autoplay blocked)
- VideoPlayer catches video.play() exceptions
- PDFViewer shows loading spinner during iframe load
- PDF.js viewer used via iframe to avoid dependency and handle errors externally
- No try/catch blocks for typical execution; relies on HTML5 media error events

## Cross-Cutting Concerns

**Logging:** None - no console.log in production code (except debug in ChaosController)

**Validation:** None - no input validation (all content from static config or trusted external sources)

**Authentication:** Not applicable - no backend authentication required

**Performance Optimization:**
- Dynamic imports with ssr: false for heavy components
- CSS-only animations where possible (reduce JS execution)
- useCallback hooks in ChaosController to prevent unnecessary re-renders
- IntersectionObserver in ScrollMeme to trigger playback only when visible
- Inline styles instead of CSS-in-JS libraries (minimize runtime overhead)

---

*Architecture analysis: 2026-02-02*
