Sentry wizard has errors when installing on newest Nuxt/Vue/Vite, so need to install manually.

## Setup

1. `npm install @sentry/nuxt --save --legacy-peer-deps`

2. Create `sentry.client.config.ts` file in the root, with `nuxt.config.ts`.

```TS
// sentry.client.config.ts
import * as Sentry from '@sentry/nuxt'

const {
  public: { sentryDsn }
} = useRuntimeConfig()

Sentry.init({
  dsn: sentryDsn, // or insert dsn as string

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],

  // Performance metrics collection settings
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
/**
 * Make the sample rates explicit debug defaults, not copy-paste production values.
 * tracesSampleRate: 1.0 and the replay rates will generate a lot of telemetry and can collect user
 * interaction data. Gate these behind env vars or label them as staging-only.
 */

```

```TS
// sentry.server.config.ts
import * as Sentry from '@sentry/nuxt'

Sentry.init({
  dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,

  // For server, log only critical traces
  tracesSampleRate: 1.0,
})
```

3. `nuxt.config.ts`

```TS
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@sentry/nuxt' // Add Sentry module
  ],

  sentry: {
    // Enable automatic source map upload so Sentry shows .vue paths instead of minified JS.
    sourceMapsUploadOptions: {
      org: 'self-12e',
      project: 'javascript-nuxt',
      // Auth token needed for production builds (obtain from Sentry).
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
  },

  runtimeConfig: {
    public: {
      // Pass DSN via environment variables.
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
    }
  }
})
```

4. Install uuid

```sh
npm install uuid
npm install --save-dev @types/uuid
```

## Usage

```TS
import * as Sentry from '@sentry/nuxt'

// Build a safe, allowlisted payload before logging.
const sanitizedMetadata = {
  id: rawMetadata.id,
  status: rawMetadata.status,
  // redact or omit anything sensitive before attaching it to Sentry
  email: '[redacted]'
}

// Logging the error for debugging purposes
Sentry.captureException(metadataResult.error, {
  extra: { sanitizedMetadata }
})
```
