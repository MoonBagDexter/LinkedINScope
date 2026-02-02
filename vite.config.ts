import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Polyfill for Solana wallet adapter (requires process.env, global)
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Buffer polyfill for Solana wallet adapter
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
    include: ['buffer'],
  },
})
