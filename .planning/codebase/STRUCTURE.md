# Codebase Structure

**Analysis Date:** 2026-02-02

## Directory Layout

```
epsteindrop/
├── app/                          # Next.js app directory
│   ├── components/               # Reusable React components
│   │   ├── AudioPlayer.jsx       # Audio playback controller
│   │   ├── ChaosController.jsx   # Popup/meme spawning orchestrator
│   │   ├── CornerMeme.jsx        # Corner floating meme video
│   │   ├── DegenOverlays.jsx     # Visual distortion overlays
│   │   ├── MemePopup.jsx         # Full-screen meme popup modal
│   │   ├── ScreenEffects.jsx     # Screen-wide glitch effects
│   │   └── ScrollMeme.jsx        # Scroll-triggered meme video
│   ├── memes/                    # Media configuration
│   │   └── memeConfig.js         # Meme array, chaos settings, randomizer
│   ├── globals.css               # Global styles and animations
│   ├── layout.js                 # Root layout wrapper (metadata, fonts)
│   └── page.js                   # Home page (main content)
├── public/                       # Static assets
│   └── memes/                    # Local meme video files (not included)
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies (React, Next.js)
├── package-lock.json             # Locked dependency versions
├── README.md                      # Project overview
└── PLAN.txt                       # Development notes
```

## Directory Purposes

**app/:**
- Purpose: Contains all Next.js app router pages and components
- Contains: Page layouts, components, configuration, styles
- Key files: `page.js` (home), `layout.js` (root wrapper), `globals.css` (theme)

**app/components/:**
- Purpose: Reusable React components for UI features
- Contains: Client-side interactive components (all marked with 'use client')
- Key files: AudioPlayer, ChaosController, ScreenEffects, MemePopup

**app/memes/:**
- Purpose: Store configuration for meme sequences and chaos behavior
- Contains: Static data exports
- Key files: `memeConfig.js` (MEMES array, CHAOS_CONFIG object)

**public/:**
- Purpose: Serve static files directly to browser
- Contains: Meme video files, images, fonts (via CDN)
- Key files: `memes/` subdirectory (video files not in repo)

## Key File Locations

**Entry Points:**
- `C:\Users\thedi\Desktop\epsteindrop\app\layout.js`: Root HTML layout, metadata, global styles import
- `C:\Users\thedi\Desktop\epsteindrop\app\page.js`: Home page with all content sections

**Configuration:**
- `C:\Users\thedi\Desktop\epsteindrop\app\memes\memeConfig.js`: Meme definitions, chaos behavior
- `C:\Users\thedi\Desktop\epsteindrop\next.config.js`: Next.js build settings

**Core Logic:**
- `C:\Users\thedi\Desktop\epsteindrop\app\page.js`: Page component (1382 lines), contains data objects and most UI logic
- `C:\Users\thedi\Desktop\epsteindrop\app\components\ChaosController.jsx`: Chaos effect orchestration
- `C:\Users\thedi\Desktop\epsteindrop\app\components\AudioPlayer.jsx`: Audio playback logic

**Styling:**
- `C:\Users\thedi\Desktop\epsteindrop\app\globals.css`: All animations and global styles (369 lines)

## Naming Conventions

**Files:**
- Component files: PascalCase with .jsx extension (e.g., `AudioPlayer.jsx`)
- Config/data files: camelCase with .js extension (e.g., `memeConfig.js`)
- Layout files: camelCase with .js extension (e.g., `layout.js`, `page.js`)
- Styles: globals.css (global styles only)

**Directories:**
- Feature directories: lowercase (e.g., `components/`, `memes/`)
- Public assets: lowercase (e.g., `public/`, `memes/`)

**Functions & Variables:**
- Components: PascalCase (e.g., `AudioPlayer`, `ChaosController`)
- Functions: camelCase (e.g., `getRandomMeme`, `handleClosePopup`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `RELEASES`, `CHAOS_CONFIG`, `MEMES`)
- React hooks: use + camelCase (e.g., `useState`, `useEffect`)
- Event handlers: `handle` + PascalCase (e.g., `handleClosePopup`, `handleProgressClick`)

**CSS:**
- Class names: kebab-case (e.g., `.vhs-hover`, `.glitch-text`, `.classified-stamp`)
- Animation names: camelCase (e.g., `fadeUp`, `vhsTracking`, `glitchFlicker`)
- Custom properties: kebab-case (e.g., not used in this codebase)

## Where to Add New Code

**New Feature (e.g., new media type):**
- Primary code: `C:\Users\thedi\Desktop\epsteindrop\app\page.js` (add data to RELEASES object, add rendering logic in Section component)
- Tests: No test directory exists
- Component file: Create new component in `C:\Users\thedi\Desktop\epsteindrop\app\components\` if reusable

**New Component/Module (reusable):**
- Implementation: `C:\Users\thedi\Desktop\epsteindrop\app\components\ComponentName.jsx`
- Pattern: Mark with `'use client'` at top if needs interactivity
- Import: Use in `page.js` or other components via `import ComponentName from './components/ComponentName'`

**New Animation/Style:**
- Styles: Add keyframes and class definitions to `C:\Users\thedi\Desktop\epsteindrop\app\globals.css`
- Pattern: Follow existing animation naming (camelCase for @keyframes, kebab-case for class names)

**New Chaos Behavior:**
- Configuration: Update `C:\Users\thedi\Desktop\epsteindrop\app\memes\memeConfig.js` (CHAOS_CONFIG object)
- Logic: Update `C:\Users\thedi\Desktop\epsteindrop\app\components\ChaosController.jsx` (add useEffect hooks or callbacks)

**Static Assets (media files):**
- Location: `C:\Users\thedi\Desktop\epsteindrop\public\memes\` for meme videos
- Filename pattern: `meme-01.mp4`, `meme-02.mp4`, etc. (matches MEMES array)
- Reference: Use relative path `/memes/meme-01.mp4` in config

## Special Directories

**node_modules/:**
- Purpose: Installed npm dependencies
- Generated: Yes (via npm install)
- Committed: No (in .gitignore)
- Size: Large (~300MB+)

**public/:**
- Purpose: Serve static assets directly to browser without processing
- Generated: No (manually created)
- Committed: Partially (directory exists, meme videos not included)
- Contents: Meme video files should go here

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes (via npm run build or next dev)
- Committed: No (in .gitignore)
- Contents: Compiled pages, webpack bundles, static assets

## Import Patterns

**External Imports (from node_modules):**
```javascript
import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
```

**Relative Imports (within app):**
```javascript
import AudioPlayer from './components/AudioPlayer'
import { MEMES, CHAOS_CONFIG, getRandomMeme } from './memes/memeConfig'
```

**Dynamic Component Imports:**
```javascript
const DegenOverlays = dynamic(() => import('./components/DegenOverlays'), { ssr: false })
```

**Pattern:** All components use relative paths with './' prefix; no path aliases (@/) configured

## Component Organization

**page.js (Main Page):**
- Lines 1-112: RELEASES data object (5 release groups with documents, audio, videos)
- Lines 114-120: TIMELINE data array
- Lines 122-165: Utility components (GlitchText, BrutalistHeader, Redacted)
- Lines 191-255: DocumentCard component
- Lines 258-441: VideoPlayer component (inline)
- Lines 444-601: MediaCard component
- Lines 604-735: Section component
- Lines 738-896: PDFViewer component
- Lines 899-978: Timeline component
- Lines 981-1382: EpsteinDrop main component (root), renders layout and all sections

**Components Directory:**
- Each file exports a single default function component
- All marked with `'use client'` (client-side rendering)
- Use hook-based state management (useState, useEffect, useRef, useCallback)
- Inline styles using style prop (no className usage except for CSS animations)

## No Monorepo or Workspaces

- Single Next.js app
- No TypeScript (JavaScript with .js/.jsx extensions)
- No src/ directory wrapper
- App router (not pages router)
- No api/ routes configured

---

*Structure analysis: 2026-02-02*
