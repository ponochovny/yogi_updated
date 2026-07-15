// sentry.server.config.ts
import * as Sentry from '@sentry/nuxt'

const isSentryEnabled =
  Boolean(process.env.NUXT_PUBLIC_SENTRY_DSN) &&
  (process.env.NODE_ENV === 'production' ||
    process.env.NUXT_PUBLIC_SENTRY_ENV === 'production')

Sentry.init({
  dsn: isSentryEnabled ? process.env.NUXT_PUBLIC_SENTRY_DSN : undefined,
  enabled: isSentryEnabled,

  // For server, log only critical traces
  tracesSampleRate: isSentryEnabled ? 0.1 : 0
})
