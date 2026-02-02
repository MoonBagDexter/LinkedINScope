# Phase 1: Foundation & Auth - Research

**Researched:** 2026-02-02
**Domain:** Solana wallet authentication + job API integration
**Confidence:** MEDIUM

## Summary

Phase 1 requires integrating Phantom/Solana wallet authentication with JSearch API job listing display in a React TypeScript application. The standard approach uses Solana's official wallet-adapter library for multi-wallet support with session persistence, TanStack Query for API data fetching with aggressive caching (critical for 500 req/month quota), and Vite as the build tool for fast development.

The research identified three critical constraints: (1) JSearch API quota limits require 24+ hour cache TTL from day one, (2) Solana wallet adapter needs proper context wrapping to avoid common errors, and (3) storing sensitive data in localStorage exposes XSS vulnerabilities. The recommended stack prioritizes established libraries over custom solutions, particularly for wallet connection state management and API caching.

**Primary recommendation:** Use Solana wallet-adapter with autoConnect for session persistence, TanStack Query with 24-hour staleTime for JSearch API caching, and Vite + React + TypeScript for the frontend stack.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @solana/wallet-adapter-react | 0.15.39 | Wallet connection management | Official Solana library, multi-wallet support, autoConnect for session persistence |
| @solana/wallet-adapter-react-ui | 0.9.39 | Pre-built wallet UI components | Official UI components, handles modal/button states |
| @solana/wallet-adapter-wallets | Latest | Wallet adapter collection | Includes PhantomWalletAdapter + others for flexibility |
| @solana/web3.js | Latest | Solana blockchain interactions | Required peer dependency for wallet adapters |
| @tanstack/query | v5 | API data fetching/caching | Industry standard for server state, built-in cache management |
| vite | Latest | Build tool | Fast HMR, zero-config TypeScript support, modern dev experience |
| react | 18+ | UI framework | Industry standard, hooks-based architecture |
| typescript | 5+ | Type safety | Catch errors at compile time, better DX |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss | 3+ | Utility-first CSS | Rapid UI development, crypto/degen aesthetic with custom theme |
| axios | Latest | HTTP client | If need request interceptors, cancellation, better DX than fetch |
| zustand | Latest | Global state | Lightweight alternative to Context API for wallet state |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Solana wallet-adapter | Phantom React SDK | Phantom-only (no multi-wallet), requires Portal registration, newer/less mature |
| TanStack Query | SWR or custom fetch | Less powerful cache invalidation, no built-in retry/refetch strategies |
| Vite | Next.js | Next.js adds SSR complexity unnecessary for client-only app |
| axios | native fetch | Fetch is zero-bundle, but lacks interceptors and cleaner error handling |

**Installation:**
```bash
# Core dependencies
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js
npm install @tanstack/react-query
npm install react react-dom
npm install -D typescript @types/react @types/react-dom

# Build tooling
npm install -D vite @vitejs/plugin-react

# Supporting
npm install -D tailwindcss postcss autoprefixer
npm install axios
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── JobCard.tsx     # Individual job listing card
│   ├── JobList.tsx     # Job cards container
│   └── WalletButton.tsx # Custom wallet connect button (optional)
├── contexts/           # React context providers
│   └── WalletProvider.tsx # Solana wallet provider wrapper
├── hooks/              # Custom React hooks
│   ├── useJobs.ts      # TanStack Query hook for job fetching
│   └── useWallet.ts    # Re-export wallet adapter hooks if needed
├── services/           # API calls and external services
│   ├── jsearch.ts      # JSearch API client functions
│   └── api.ts          # Base axios instance config
├── types/              # TypeScript types and interfaces
│   ├── job.ts          # Job listing type definitions
│   └── wallet.ts       # Wallet-related types
├── utils/              # Helper functions
│   ├── formatting.ts   # Address truncation, currency format
│   └── constants.ts    # API keys, endpoints
├── App.tsx
├── main.tsx
└── index.css
```

### Pattern 1: Wallet Provider Setup
**What:** Wrap app with ConnectionProvider → WalletProvider → WalletModalProvider for wallet state management
**When to use:** Every Solana dApp requires this provider structure
**Example:**
```typescript
// Source: https://solana.com/developers/cookbook/wallets/connect-wallet-react
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

const wallets = [new PhantomWalletAdapter()];
const endpoint = clusterApiUrl('mainnet-beta');

function App() {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <YourApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Pattern 2: TanStack Query Setup with Aggressive Caching
**What:** Configure QueryClient with long staleTime/cacheTime for API quota conservation
**When to use:** Always with rate-limited APIs (JSearch: 500 req/month)
**Example:**
```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/overview
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours - data stays fresh
      cacheTime: 1000 * 60 * 60 * 48, // 48 hours - keep in cache
      refetchOnWindowFocus: false,     // Don't waste quota on refocus
      refetchOnMount: false,           // Use cached data on remount
      retry: 1,                        // Minimize failed request quota usage
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProviderWrapper>
        <JobBoard />
      </WalletProviderWrapper>
    </QueryClientProvider>
  );
}
```

### Pattern 3: Type-Safe Job Data Fetching
**What:** Use TanStack Query with TypeScript generics for API calls
**When to use:** All external API interactions
**Example:**
```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/typescript
// types/job.ts
export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string;
  job_state: string;
  job_apply_link: string;
  job_min_salary?: number;
  job_max_salary?: number;
}

// services/jsearch.ts
export async function fetchJobs(query: string): Promise<Job[]> {
  const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
    params: { query, num_pages: 1 },
    headers: {
      'X-RapidAPI-Key': import.meta.env.VITE_JSEARCH_API_KEY,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  });
  return response.data.data;
}

// hooks/useJobs.ts
import { useQuery } from '@tanstack/react-query';

export function useJobs(query: string) {
  return useQuery({
    queryKey: ['jobs', query],
    queryFn: () => fetchJobs(query),
    enabled: !!query, // Only fetch when query exists
  });
}
```

### Pattern 4: Wallet Address Display Truncation
**What:** Show first 4 and last 4 characters of Solana address for UX
**When to use:** Displaying public keys in UI
**Example:**
```typescript
// Source: Research - Solana address display standards
// utils/formatting.ts
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Usage: "HN7c...YWrH" from "HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH"
```

### Pattern 5: Environment Variables in Vite
**What:** Use VITE_ prefix for client-exposed environment variables
**When to use:** API keys, endpoints, feature flags
**Example:**
```typescript
// Source: https://vite.dev/guide/env-and-mode
// .env.local (add to .gitignore)
VITE_JSEARCH_API_KEY=your_api_key_here
VITE_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

// Usage in code
const apiKey = import.meta.env.VITE_JSEARCH_API_KEY;
const endpoint = import.meta.env.VITE_SOLANA_RPC_ENDPOINT;
```

### Anti-Patterns to Avoid
- **Don't store wallet private keys or tokens in localStorage** - XSS vulnerability, use in-memory state only
- **Don't use signTransaction/signAllTransactions without checking if defined** - Not all wallets support these methods
- **Don't forget to wrap app with WalletContext and ConnectionContext** - Causes "undefined" errors
- **Don't use fetch without error handling** - Use axios or wrap fetch in try/catch with proper error types
- **Don't set staleTime: 0 with limited API quota** - Will refetch unnecessarily and exhaust quota

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Wallet connection modal UI | Custom modal with wallet detection | @solana/wallet-adapter-react-ui | Handles 20+ wallets, mobile detection, error states, maintained by Solana |
| API response caching | useState + localStorage | TanStack Query | Handles cache invalidation, background refetch, deduplication, stale-while-revalidate |
| Wallet session persistence | Custom localStorage logic | WalletProvider autoConnect prop | Built-in, handles wallet disconnection, clears on logout |
| HTTP request retry logic | Custom retry with setTimeout | TanStack Query retry config | Exponential backoff, configurable attempts, error handling |
| Address validation | Regex patterns | PublicKey.isOnCurve() from @solana/web3.js | Handles Solana-specific validation, checks curve membership |
| Loading/error UI states | Manual boolean flags | TanStack Query status/isLoading/isError | Unified state machine, prevents race conditions |

**Key insight:** Wallet connection and API caching have edge cases that are expensive to debug (wallet disconnection race conditions, cache invalidation timing, mobile wallet detection). The ecosystem has mature libraries that handle these - use them.

## Common Pitfalls

### Pitfall 1: API Quota Exhaustion
**What goes wrong:** JSearch free tier (500 req/month) exhausts in days with default refetch behavior
**Why it happens:** TanStack Query defaults to staleTime: 0, refetchOnWindowFocus: true, refetchOnMount: true
**How to avoid:** Set aggressive caching in QueryClient config (24h+ staleTime, disable refetch triggers)
**Warning signs:** Seeing 429 errors, API quota depleted warning, multiple network requests for same query

### Pitfall 2: Missing Wallet Context Wrappers
**What goes wrong:** "Cannot read property 'publicKey' of undefined" or "wallet is not a function"
**Why it happens:** Using useWallet() hook outside of WalletProvider context tree
**How to avoid:** Ensure ConnectionProvider → WalletProvider → WalletModalProvider wraps entire app in root
**Warning signs:** Undefined errors when accessing wallet properties, React context warnings

### Pitfall 3: Webpack 5 Polyfill Errors (Create React App)
**What goes wrong:** Module not found errors for 'crypto', 'stream', 'zlib' when using wallet-adapter
**Why it happens:** Webpack 5 removed automatic Node polyfills that Solana libraries expect
**How to avoid:** Use Vite instead of Create React App, or add polyfills manually with react-app-rewired
**Warning signs:** Build fails with "Module not found: Can't resolve 'crypto'"

### Pitfall 4: Storing Sensitive Data in localStorage
**What goes wrong:** XSS attacks can steal wallet connection tokens or API keys
**Why it happens:** localStorage is accessible to all JavaScript, including injected malicious scripts
**How to avoid:** Store only non-sensitive data (user preferences, theme). Use httpOnly cookies for tokens, in-memory state for wallet connection
**Warning signs:** Security audit flags, storing anything with "token" or "key" in localStorage

### Pitfall 5: Not Checking Optional Wallet Methods
**What goes wrong:** "signTransaction is not a function" errors with some wallets
**Why it happens:** Only sendTransaction is required by all wallets; signTransaction/signAllTransactions/signMessage are optional
**How to avoid:** Check if method exists before calling: `if (wallet.signTransaction) { ... }`
**Warning signs:** Errors only occur with specific wallets (works with Phantom, breaks with others)

### Pitfall 6: React Strict Mode Wallet Disconnection
**What goes wrong:** Wallet disconnects on page refresh despite autoConnect: true, walletName key wiped from localStorage
**Why it happens:** React.StrictMode double-invokes effects, causing race condition in wallet adapter
**How to avoid:** Known issue in development mode only, works correctly in production. Can disable StrictMode for wallet-heavy apps
**Warning signs:** Wallet connects then immediately disconnects in dev, walletName disappears from localStorage

### Pitfall 7: JSearch Query Optimization
**What goes wrong:** API returns empty or partial results, wasting quota on poor queries
**Why it happens:** Query too broad, location mismatch, wrong employment type filters
**How to avoid:** Use specific queries ("McDonald's crew member USA" not "jobs"), filter by employment_type, limit to 1 page initially
**Warning signs:** Empty data arrays, irrelevant job listings, quota consumed without useful results

## Code Examples

Verified patterns from official sources:

### Job Card Component with Minimal Info
```typescript
// Source: User decisions from CONTEXT.md + React patterns
// components/JobCard.tsx
import { Job } from '../types/job';

interface JobCardProps {
  job: Job;
  onApplyClick: (jobId: string, applyLink: string) => void;
}

export function JobCard({ job, onApplyClick }: JobCardProps) {
  const salary = job.job_min_salary && job.job_max_salary
    ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
    : 'Pay info not listed';

  const location = [job.job_city, job.job_state]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  return (
    <div className="w-full p-4 border-2 border-purple-500 bg-black hover:bg-purple-950 transition">
      <h3 className="text-xl font-bold text-white">{job.job_title}</h3>
      <p className="text-gray-300 text-sm">{job.employer_name}</p>
      <p className="text-gray-400 text-sm">{location}</p>
      <p className="text-green-400 font-semibold mt-2">{salary}</p>
      <button
        onClick={() => onApplyClick(job.job_id, job.job_apply_link)}
        className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 px-4 hover:from-purple-700 hover:to-pink-700 transition"
      >
        QUICK APPLY
      </button>
    </div>
  );
}
```

### useWallet Hook Usage Pattern
```typescript
// Source: https://solana.com/developers/cookbook/wallets/connect-wallet-react
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function Header() {
  const { publicKey, connected } = useWallet();

  return (
    <header>
      {connected && publicKey && (
        <div>Connected: {truncateAddress(publicKey.toBase58())}</div>
      )}
      <WalletMultiButton />
    </header>
  );
}
```

### JSearch API Service Layer
```typescript
// Source: JSearch API research + axios patterns
// services/jsearch.ts
import axios from 'axios';
import { Job } from '../types/job';

const jsearchClient = axios.create({
  baseURL: 'https://jsearch.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': import.meta.env.VITE_JSEARCH_API_KEY,
    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
  },
});

export interface JobSearchParams {
  query: string;
  num_pages?: number;
  page?: number;
}

export async function searchJobs(params: JobSearchParams): Promise<Job[]> {
  try {
    const response = await jsearchClient.get('/search', {
      params: {
        query: params.query,
        num_pages: params.num_pages || 1,
        page: params.page || 1,
      },
    });
    return response.data.data || [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      throw new Error('API quota exceeded. Try again later.');
    }
    throw error;
  }
}
```

### Custom Hook with TanStack Query
```typescript
// Source: https://tanstack.com/query/latest/docs/framework/react/typescript
// hooks/useJobs.ts
import { useQuery } from '@tanstack/react-query';
import { searchJobs, JobSearchParams } from '../services/jsearch';

export function useJobs(searchQuery: string) {
  return useQuery({
    queryKey: ['jobs', searchQuery],
    queryFn: () => searchJobs({
      query: searchQuery,
      num_pages: 1 // Conserve quota, fetch one page at a time
    }),
    enabled: !!searchQuery && searchQuery.length > 0,
    // Caching config already set in QueryClient defaultOptions
  });
}

// Usage in component
function JobList() {
  const { data: jobs, isLoading, error } = useJobs('fast food crew member USA');

  if (isLoading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {jobs?.map(job => <JobCard key={job.job_id} job={job} />)}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Create React App | Vite | 2021-2022 | 10-20x faster HMR, no webpack config, native ESM |
| Redux for all state | TanStack Query for server state, Context/Zustand for UI state | 2020-2022 | Simpler code, automatic cache management, less boilerplate |
| Manual wallet detection | @solana/wallet-adapter with WalletProvider | 2021 | Multi-wallet support, mobile detection, maintained adapters |
| Custom fetch wrappers | TanStack Query | 2019-2020 | Built-in caching, retry, deduplication, loading states |
| PropTypes | TypeScript | 2018-2020 | Compile-time type checking, better IDE support, safer refactors |
| react-scripts 4.x | react-scripts 5.x (or Vite) | 2021 | Webpack 5, better tree-shaking, but polyfill issues with Solana libs |

**Deprecated/outdated:**
- **Phantom React SDK**: Newer alternative to wallet-adapter, but immature (released 2024), requires Portal registration, Phantom-only. Stick with wallet-adapter for multi-wallet support.
- **localStorage for auth tokens**: XSS vulnerability. Use httpOnly cookies or in-memory state only.
- **SWR**: Still maintained but TanStack Query has better TypeScript support, more features, stronger ecosystem momentum in 2026.
- **react-scripts 5.0.0 with Solana**: Known polyfill errors. Use Vite or downgrade to 4.0.3 if CRA required.

## Open Questions

Things that couldn't be fully resolved:

1. **JSearch API Free Tier Exact Quota**
   - What we know: Multiple sources mention "500 requests" but unclear if this is per month (assumed) or per query results
   - What's unclear: Exact free tier limits, whether pagination counts as additional requests, rate limiting per second/minute
   - Recommendation: Start with 24h cache, monitor usage closely in first week, contact OpenWeb Ninja for quota clarification

2. **Phantom-Only vs Multi-Wallet Trade-off**
   - What we know: User context mentions "Phantom wallet" specifically, but wallet-adapter supports multiple wallets
   - What's unclear: Should we restrict to Phantom only or allow Solflare, Backpack, etc?
   - Recommendation: Use wallet-adapter but configure wallets=[PhantomWalletAdapter] only for cleaner UX, can add others later

3. **Session Persistence Security vs UX**
   - What we know: autoConnect stores walletName in localStorage, research shows localStorage vulnerable to XSS
   - What's unclear: Is walletName alone (without private keys) acceptable security risk for better UX?
   - Recommendation: Use autoConnect (standard practice in Solana ecosystem), walletName is not sensitive, private keys never stored

4. **Optimal Initial Job Count**
   - What we know: Context says "~6-8 visible on screen", JSearch returns up to 500 per query
   - What's unclear: Should we fetch 10 jobs initially or fetch 50 and paginate client-side to reduce API calls?
   - Recommendation: Fetch 50 jobs (num_pages: 1), display 10 per "page", paginate client-side to conserve quota

## Sources

### Primary (HIGH confidence)
- Solana Developer Cookbook: https://solana.com/developers/cookbook/wallets/connect-wallet-react - Wallet integration patterns
- Solana Wallet Adapter GitHub: https://github.com/anza-xyz/wallet-adapter - Official adapter architecture, FAQ
- TanStack Query Docs: https://tanstack.com/query/latest/docs/framework/react/overview - Caching and TypeScript patterns
- Vite Documentation: https://vite.dev/guide/env-and-mode - Environment variables, build configuration
- Phantom Docs: https://docs.phantom.com/sdks/react-sdk - Phantom React SDK (compared alternative)

### Secondary (MEDIUM confidence)
- LogRocket: Axios vs Fetch 2025 - https://blog.logrocket.com/axios-vs-fetch-2025/ - HTTP client comparison
- Medium (Robin Viktorsson): Vite + React + TypeScript Setup 2026 - https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-vite-2025-468f6556aaf2
- CyberSierra: JWT Storage Security - https://cybersierra.co/blog/react-jwt-storage-guide/ - localStorage security risks
- DEV.to (multiple authors): React Query + TypeScript patterns, wallet adapter issues
- Sam Solutions: React vs Next.js 2026 - https://sam-solutions.com/blog/react-vs-nextjs/ - Framework comparison

### Tertiary (LOW confidence)
- JSearch API Pricing: Multiple sources (RapidAPI, Zyla API Hub, OpenWeb Ninja) - Quota details unclear/conflicting
- Solana address truncation pattern: Inferred from community examples, not official docs
- Degen aesthetic design: Crypto/Web3 Tailwind templates on ThemeForest, no official design system found

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7/official docs, version numbers current
- Architecture patterns: HIGH - Patterns sourced from official documentation (Solana, TanStack, Vite)
- Don't hand-roll: HIGH - Based on official library capabilities and documented edge cases
- Pitfalls: MEDIUM - Combination of official FAQs (wallet-adapter), GitHub issues, and dev blogs
- JSearch API specifics: LOW - Quota limits unclear, no official docs accessed successfully

**Research date:** 2026-02-02
**Valid until:** 2026-03-02 (30 days - stack is mature/stable, but check for wallet-adapter updates)

**Notes:**
- JSearch API documentation was not fully accessible via WebFetch; quota details require verification during implementation
- Phantom React SDK is newer but less mature than wallet-adapter; recommend wallet-adapter for multi-wallet flexibility
- All TypeScript and React patterns reflect current 2026 best practices (hooks, functional components, strict mode)
