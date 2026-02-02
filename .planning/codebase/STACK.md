# Technology Stack

**Analysis Date:** 2026-02-02

## Languages

**Primary:**
- JavaScript (JSX) - Frontend UI components and pages
- CSS - Styling and animations

## Runtime

**Environment:**
- Node.js - Via npm/package manager

**Package Manager:**
- npm - Package management
- Lockfile: `C:\Users\thedi\Desktop\epsteindrop\package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 14.2.0 - Full-stack React framework with App Router
  - Location: `C:\Users\thedi\Desktop\epsteindrop\`
  - Used for: Server-side rendering, static generation, API routes, file-based routing

- React 18.3.0 - UI component library
  - Used for: Building interactive components, state management with hooks

**Build/Dev:**
- ESLint 8.57.0 - Code linting
- eslint-config-next 14.2.0 - Next.js ESLint configuration preset

## Key Dependencies

**Critical:**
- `next` (14.2.0) - Full-stack framework for production-ready React apps
- `react` (18.3.0) - Core React library for component building
- `react-dom` (18.3.0) - DOM rendering for React components

## Configuration

**Environment:**
- No `.env` files detected - Application uses only static data
- No environment variables required for development or deployment

**Build:**
- `C:\Users\thedi\Desktop\epsteindrop\next.config.js` - Next.js configuration
  - Feature: React Strict Mode enabled
  - Other settings: Default Next.js 14 configuration

**Server Scripts:**
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Platform Requirements

**Development:**
- Node.js (compatible with Next.js 14 - recommend LTS)
- npm or equivalent package manager
- Modern browser for development

**Production:**
- Deployment target: Vercel (recommended, mentioned in README)
- Can deploy to any Node.js-compatible hosting (Heroku, AWS, etc.)
- Static export possible with next.config.js modification

## Key Features by Stack

**Next.js App Router:**
- `C:\Users\thedi\Desktop\epsteindrop\app\layout.js` - Root layout with metadata and Google Fonts
- `C:\Users\thedi\Desktop\epsteindrop\app\page.js` - Main page (45KB - contains all UI logic)
- `C:\Users\thedi\Desktop\epsteindrop\app\globals.css` - Global styles (6.8KB)

**React Components:**
- Client components use `'use client'` directive for interactivity
- Dynamic imports via `next/dynamic` for code-splitting heavy components:
  - `C:\Users\thedi\Desktop\epsteindrop\app\components\DegenOverlays.jsx`
  - `C:\Users\thedi\Desktop\epsteindrop\app\components\ScreenEffects.jsx`
  - `C:\Users\thedi\Desktop\epsteindrop\app\components\ChaosController.jsx`
  - `C:\Users\thedi\Desktop\epsteindrop\app\components\ScrollMeme.jsx`
- Regular components:
  - `C:\Users\thedi\Desktop\epsteindrop\app\components\AudioPlayer.jsx` - Custom HTML5 audio player
  - Other meme/effects components

**Styling:**
- Vanilla CSS (no Tailwind, no CSS-in-JS)
- External fonts: IBM Plex Mono and Space Grotesk from Google Fonts
- CSS features: Animations, scanline effects, glitch effects, transitions

**Metadata & SEO:**
- Next.js metadata API in `layout.js`
- OpenGraph and Twitter card configuration
- Dynamic title and description tags

---

*Stack analysis: 2026-02-02*
