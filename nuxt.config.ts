import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    // '@nuxtjs/seo',
    // '@nuxtjs/leaflet',
    '@nuxtjs/i18n',
    '@nuxtjs/eslint-module',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/eslint',
    // '@nuxt/a11y',
    // '@nuxt/test-utils',
    // '@pinia/nuxt',
    'nuxt-vitalizer',
    'shadcn-nuxt',
    '@sentry/nuxt'
  ],

  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@lucide/vue',
        '@tanstack/vue-table',
        '@vee-validate/zod',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/core',
        'better-auth/vue',
        'class-variance-authority',
        'clsx',
        'date-fns',
        'reka-ui',
        'tailwind-merge',
        'vee-validate',
        'vue-sonner',
        'zod',
        'drizzle-orm',
        'drizzle-orm/pg-core'
      ]
    }
  },

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'nl', name: 'Nederlands', file: 'nl.json' }
    ]
  },

  shadcn: {
    prefix: '',
    componentDir: './app/shared/ui'
  },

  sentry: {
    // Enable automatic upload of source maps so Sentry shows readable paths to .vue files instead of minified JS
    sourceMapsUploadOptions: {
      org: 'self-12e',
      project: 'javascript-nuxt',
      // Token required for production builds (obtain from Sentry)
      authToken: process.env.SENTRY_AUTH_TOKEN
    }
  },

  routeRules: {
    '/business/**': {
      appLayout: 'business',
      appMiddleware: 'auth',
      ssr: false,
      isr: false
    },
    '/profile/**': {
      appLayout: 'dashboard-user',
      appMiddleware: 'auth',
      ssr: false,
      isr: false
    }
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    public: {
      baseUrl: '',
      // cloudinary
      cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? '',
      // sentry
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
      sentryTracesSampleRate:
        process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1',
      sentryReplaysSessionSampleRate:
        process.env.NUXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? '0.01',
      sentryReplaysOnErrorSampleRate:
        process.env.NUXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? '0.1'
    }
  },

  app: {
    head: {
      title: 'Unnamed',
      titleTemplate: '%s · Yogi App',
      htmlAttrs: {
        lang: 'en'
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  }
})
