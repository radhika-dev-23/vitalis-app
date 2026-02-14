import { registerSW } from 'virtual:pwa-register'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available! Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('✅ App ready to work offline')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)