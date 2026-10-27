import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './contexts/ThemeContext'
import { ErrorBoundary } from './components/error/ErrorBoundary'
import { initSentry } from './lib/error/errorMonitoring'
import './i18n'
import './index.css'
import App from './App.tsx'

// 1. Initialize Sentry FIRST — before any React code runs
initSentry()

// Synchronously set dir/lang from URL BEFORE React renders — prevents any FOID flash
;(function () {
  const m = window.location.pathname.match(/^\/(ar|en)(\/|$)/)
  const l = m ? m[1] : 'ar'
  document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', l)
})()


/*
 * StrictMode is intentionally omitted.
 *
 * @vis.gl/react-google-maps v1.x (latest: 1.8.3) is incompatible with
 * React 19's stricter StrictMode double-mount behavior. The library's
 * AdvancedMarker component creates a Google Maps AdvancedMarkerElement
 * inside a useEffect; when StrictMode unmounts and remounts the component,
 * the marker's internal DOM reference becomes stale and the second mount
 * throws an unhandled error (caught by the error boundary, but still noisy).
 *
 * StrictMode is a development-only tool — it has zero effect on production
 * builds. Remove this comment and re-add <StrictMode> once the library ships
 * React 19 StrictMode support (track: github.com/visgl/react-google-maps).
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  }, { once: true })
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </ErrorBoundary>,
)