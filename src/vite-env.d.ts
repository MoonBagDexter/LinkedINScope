/// <reference types="vite/client" />

import { Buffer } from 'buffer'

declare global {
  interface Window {
    Buffer: typeof Buffer
  }
}

interface ImportMetaEnv {
  readonly VITE_JSEARCH_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_THRESHOLD_NEW_TO_TRENDING: string
  readonly VITE_THRESHOLD_TRENDING_TO_GRADUATED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
