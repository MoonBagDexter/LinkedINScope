# LinkedINScope

Job tracking Kanban board with real-time collaboration features.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 4
- **State**: TanStack Query (React Query)
- **Backend**: Supabase (auth, database, realtime)
- **Wallet**: Solana wallet adapter

## Project Structure

```
src/
├── components/    # React components (JobCard, KanbanBoard, etc.)
├── hooks/         # Custom hooks (useJobs, usePresence, useRealtimeSync)
├── services/      # API/external services (supabase, jsearch, clickTracker)
├── contexts/      # React contexts (WalletProvider)
├── types/         # TypeScript types (job.ts, kanban.ts)
└── utils/         # Helper functions
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Key Patterns

- Supabase client is in `src/services/supabase.ts`
- Real-time subscriptions use Supabase channels
- Jobs flow through Kanban lanes (see `types/kanban.ts`)
- Click tracking via `clickTracker.ts` service

## Workflow

- After every completed change, commit and push to GitHub immediately
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Environment Variables

See `.env.example` for required variables (Supabase URL/key, API keys)
