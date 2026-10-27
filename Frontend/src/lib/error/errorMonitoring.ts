/**
 * Sentry Error Monitoring
 *
 * Single source of truth for all Sentry configuration.
 * Uses @sentry/react which bundles everything needed (browser SDK + React integrations).
 *
 * Call `initSentry()` once at application startup in main.tsx, BEFORE React.render().
 */

import * as Sentry from '@sentry/react';

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const HAS_VALID_DSN = !!DSN?.trim() && !/^YOUR_.*_HERE$/i.test(DSN.trim());
const IS_ENABLED = import.meta.env.VITE_ERROR_MONITORING_ENABLED !== 'false' && HAS_VALID_DSN;
const ENV = (import.meta.env.MODE ?? 'development') as string;
const IS_PROD = import.meta.env.PROD as boolean;

/**
 * Initialize Sentry. Must be called before React renders.
 * Safe to call multiple times – Sentry ignores duplicate init calls.
 */
export function initSentry(): void {
  if (!IS_ENABLED) {
    if (import.meta.env.DEV) {
      console.info('[Sentry] Disabled (no DSN or VITE_ERROR_MONITORING_ENABLED=false)');
    }
    return;
  }

  Sentry.init({
    dsn: DSN,
    environment: ENV,

    // Tracing: capture 100% in dev, 10% in production
    tracesSampleRate: IS_PROD ? 0.1 : 1.0,

    // Session Replay: record 10% of sessions, 100% on errors
    replaysSessionSampleRate: IS_PROD ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,

    // Only enable debug logging in development
    debug: !IS_PROD,

    integrations: [
      // Automatic React Router v6 tracing
      Sentry.browserTracingIntegration(),

      // Session Replay (lazy-loaded, no bundle cost on load)
      Sentry.replayIntegration({
        maskAllText: true,    // PII protection
        blockAllMedia: true,
      }),
    ],
  });

  if (import.meta.env.DEV) {
    console.info(`[Sentry] ✅ Initialized — env: ${ENV}, tracing: ${IS_PROD ? '10%' : '100%'}`);
  }
}

// ─── Convenience helpers ────────────────────────────────────────────────────

/** Attach an authenticated user to all future events */
export function setSentryUser(id: string, email?: string, username?: string): void {
  if (!IS_ENABLED) return;
  Sentry.setUser({ id, email, username });
}

/** Clear user on logout */
export function clearSentryUser(): void {
  if (!IS_ENABLED) return;
  Sentry.setUser(null);
}

/** Capture any JS error */
export function captureError(error: Error, extras?: Record<string, unknown>): void {
  if (!IS_ENABLED) {
    console.error('[Error]', error, extras);
    return;
  }
  Sentry.captureException(error, { extra: extras });
}

/** Capture a custom message */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  extras?: Record<string, unknown>,
): void {
  if (!IS_ENABLED) {
    console.log(`[${level}]`, message, extras);
    return;
  }
  Sentry.captureMessage(message, { level, extra: extras });
}

/** Add a breadcrumb for richer error context */
export function addBreadcrumb(
  message: string,
  category = 'app',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>,
): void {
  if (!IS_ENABLED) return;
  Sentry.addBreadcrumb({ message, category, level, data });
}

// Re-export the Sentry ErrorBoundary component for use in JSX trees
export { Sentry };
export const SentryErrorBoundary = Sentry.ErrorBoundary;
