import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Polyfill Buffer for Solana wallet adapter
import { Buffer } from 'buffer'
window.Buffer = Buffer

import './index.css'
// Import wallet adapter styles AFTER Tailwind to ensure they take precedence
import '@solana/wallet-adapter-react-ui/styles.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
