import type { MaybeRefOrGetter } from 'vue'

export interface PageSeoConfig {
  /** Page title (without template suffix, e.g. "Terms of Service" -> "Terms of Service · Yogi App") */
  title?: string
  /** Meta description */
  description?: string
  /** Open Graph / Twitter sharing image URL */
  image?: string
  /** Open Graph type (e.g. 'website', 'article', 'profile') */
  type?: 'website' | 'article' | 'profile' | 'book' | 'video.movie'
  /** If true, generates "noindex, nofollow" robots meta tag */
  noindex?: boolean
  /** Custom canonical URL (if omitted, generated automatically from route path) */
  canonical?: string
  /** Keywords (optional comma-separated string or array) */
  keywords?: string | string[]
  /** Twitter card type (default: 'summary_large_image') */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  /** JSON-LD structured data schema (optional) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

/** Input type for usePageSeo, allowing static values, refs, or getters */
export type PageSeoInput = {
  [K in keyof PageSeoConfig]?: MaybeRefOrGetter<PageSeoConfig[K]>
}

export const siteSeoDefaults = {
  siteName: 'Yogi',
  titleTemplate: '%s · Yogi App',
  defaultTitle: 'Yogi · Yoga, Wellness & Community',
  defaultDescription:
    'Discover and book yoga classes, studio passes, memberships, and support community causes on Yogi.',
  defaultImage: '/img/logoBg.svg',
  defaultType: 'website' as const,
  defaultTwitterCard: 'summary_large_image' as const,
  defaultLocale: 'en'
}

export const pageSeoPresets = {
  home: {
    title: 'Find Yoga Studios & Mindful Classes Near You',
    description:
      'Discover top yoga studios, book mindful classes, passes, and connect with a welcoming wellness community with Yogi.'
  },
  termsOfService: {
    title: 'Terms of Service',
    description:
      'Read the Yogi Platform Terms of Service. Understand your rights and responsibilities when booking yoga classes, studio passes, memberships, and supporting community causes.'
  },
  login: {
    title: 'Log In',
    description:
      'Sign in to your Yogi account to manage your yoga classes, passes, and studio memberships.',
    noindex: true
  },
  register: {
    title: 'Create Account',
    description:
      'Create your Yogi account to discover and book yoga classes and wellness workshops.',
    noindex: true
  },
  resetPassword: {
    title: 'Reset Password',
    description: 'Reset your Yogi account password securely.',
    noindex: true
  },
  checkout: {
    title: 'Checkout',
    description: 'Complete your yoga booking securely on Yogi.',
    noindex: true
  },
  checkoutSuccess: {
    title: 'Payment Successful',
    description:
      'Your booking has been confirmed! View your pass and class details.',
    noindex: true
  },
  checkoutCancel: {
    title: 'Checkout Cancelled',
    description:
      'Your checkout was cancelled. Return anytime to complete your booking.',
    noindex: true
  },
  profileSettings: {
    title: 'Profile Settings',
    description:
      'Manage your Yogi profile information, notifications, and security.',
    noindex: true
  },
  profileBookings: {
    title: 'My Bookings',
    description:
      'View and manage your upcoming yoga classes and active passes.',
    noindex: true
  },
  business: {
    title: 'Business Dashboard',
    description:
      'Manage your yoga studio, instructors, offerings, and class schedules.',
    noindex: true
  },
  businessCalendar: {
    title: 'Studio Schedule & Calendar',
    description:
      'View and manage scheduled yoga sessions, capacity, and studio bookings.',
    noindex: true
  },
  causes: {
    title: 'Community Causes',
    description:
      'Support mindful yoga causes and community wellness initiatives on Yogi.'
  },
  offerings: {
    title: 'Yoga Classes & Workshops',
    description:
      'Explore active yoga offerings, private sessions, and group workshops.'
  },
  studios: {
    title: 'Yoga Studios Directory',
    description:
      'Browse premier yoga studios, wellness spaces, and certified instructors near you.'
  }
} as const

export type SeoPresetKey = keyof typeof pageSeoPresets
