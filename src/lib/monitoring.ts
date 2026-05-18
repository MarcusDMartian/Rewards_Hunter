// ============================================
// MONITORING - Sentry initialization (no-op when DSN absent)
// ============================================

import * as Sentry from '@sentry/react';

let initialized = false;

export function initMonitoring(): void {
    if (initialized) return;
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) return;

    Sentry.init({
        dsn,
        environment: import.meta.env.VITE_APP_ENV || 'production',
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        integrations: [Sentry.browserTracingIntegration()],
        beforeSend(event) {
            // Strip auth tokens from breadcrumbs
            if (event.request?.headers && typeof event.request.headers === 'object') {
                const headers = event.request.headers as Record<string, string>;
                if (headers.Authorization) headers.Authorization = '[REDACTED]';
            }
            return event;
        },
    });
    initialized = true;
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
    if (!initialized) {
        // eslint-disable-next-line no-console
        console.error('[unhandled]', error, context);
        return;
    }
    Sentry.captureException(error, { extra: context });
}
