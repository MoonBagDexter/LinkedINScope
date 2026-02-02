import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Polyfill Buffer for Solana wallet adapter
import { Buffer } from 'buffer'
window.Buffer = Buffer

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
