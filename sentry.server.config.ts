// sentry.server.config.ts
import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,

  // For server, log only critical traces
  tracesSampleRate: 1.0
})
