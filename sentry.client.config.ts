import * as Sentry from '@sentry/nuxt'

const {
  public: {
    sentryDsn,
    sentryTracesSampleRate,
    sentryReplaysSessionSampleRate,
    sentryReplaysOnErrorSampleRate
  }
} = useRuntimeConfig()

const isSentryEnabled =
  Boolean(sentryDsn) &&
  (process.env.NODE_ENV === 'production' ||
    process.env.NUXT_PUBLIC_SENTRY_ENV === 'production')

const parseSampleRate = (value: unknown, fallback: number) => {
  const parsedValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > 1) {
    return fallback
  }
  return parsedValue
}

Sentry.init({
  dsn: isSentryEnabled ? sentryDsn : undefined,
  enabled: isSentryEnabled,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],

  // Performance metrics collection settings
  tracesSampleRate: isSentryEnabled
    ? parseSampleRate(sentryTracesSampleRate, 0.1)
    : 0,
  replaysSessionSampleRate: isSentryEnabled
    ? parseSampleRate(sentryReplaysSessionSampleRate, 0.01)
    : 0,
  replaysOnErrorSampleRate: isSentryEnabled
    ? parseSampleRate(sentryReplaysOnErrorSampleRate, 0.1)
    : 0
})
