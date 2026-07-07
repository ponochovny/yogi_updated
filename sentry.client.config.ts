import * as Sentry from '@sentry/nuxt'

const {
  public: { sentryDsn }
} = useRuntimeConfig()

const isSentryEnabled =
  Boolean(sentryDsn) &&
  (process.env.NODE_ENV === 'production' ||
    process.env.NUXT_PUBLIC_SENTRY_ENV === 'production')

Sentry.init({
  dsn: isSentryEnabled ? sentryDsn : undefined,
  enabled: isSentryEnabled,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],

  // Performance metrics collection settings
  tracesSampleRate: isSentryEnabled ? 0.1 : 0,
  replaysSessionSampleRate: isSentryEnabled ? 0.01 : 0,
  replaysOnErrorSampleRate: isSentryEnabled ? 0.1 : 0
})
