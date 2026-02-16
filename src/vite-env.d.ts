/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_THRESHOLD_NEW_TO_TRENDING: string;
  readonly VITE_THRESHOLD_TRENDING_TO_GRADUATED: string;
  readonly VITE_ADMIN_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
