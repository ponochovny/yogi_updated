import * as Sentry from '@sentry/nuxt'

const {
  public: { sentryDsn }
} = useRuntimeConfig()

Sentry.init({
  dsn: sentryDsn,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],

  // Performance metrics collection settings
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
