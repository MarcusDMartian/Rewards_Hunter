// ============================================
// SENTRY - Optional backend error tracking (no-op when DSN absent)
// ============================================

import * as Sentry from '@sentry/node';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
  initialized = true;
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!initialized) {
    // eslint-disable-next-line no-console
    console.error('[unhandled]', error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}
