import { computed, toValue, type ComputedRef } from 'vue'
import {
  pageSeoPresets,
  siteSeoDefaults,
  type PageSeoConfig,
  type PageSeoInput,
  type SeoPresetKey
} from '../config/seo.config'

export type PageSeoRouteInput = string | { path?: string } | null

export interface ResolvedSeoResult {
  title: string
  fullTitle: string
  description: string
  image: string
  type: 'website' | 'article' | 'profile' | 'book' | 'video.movie'
  twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player'
  canonical?: string
  robots?: string
  keywords?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * Pure function to resolve raw SEO input / preset and overrides into a complete normalized SEO object.
 */
export function resolveSeoConfig(
  input?: SeoPresetKey | PageSeoInput | (() => PageSeoConfig) | null,
  overrides?: PageSeoInput | null,
  options?: { currentPath?: string; baseUrl?: string }
): ResolvedSeoResult {
  let base: Partial<PageSeoConfig> = {}

  if (typeof input === 'string') {
    if (input in pageSeoPresets) {
      base = { ...pageSeoPresets[input as SeoPresetKey] }
    } else {
      base = { title: input }
    }
  } else if (typeof input === 'function') {
    base = input() || {}
  } else if (input && typeof input === 'object') {
    const unwrapped: Partial<PageSeoConfig> = {}
    for (const key of Object.keys(input) as (keyof PageSeoConfig)[]) {
      const val = toValue(input[key])
      if (val !== undefined) {
        // @ts-expect-error dynamic key assignment
        unwrapped[key] = val
      }
    }
    base = unwrapped
  }

  // Apply overrides if provided
  if (overrides && typeof overrides === 'object') {
    for (const key of Object.keys(overrides) as (keyof PageSeoConfig)[]) {
      const val = toValue(overrides[key])
      if (val !== undefined) {
        // @ts-expect-error dynamic key assignment
        base[key] = val
      }
    }
  }

  const title = base.title?.trim() || ''
  const fullTitle = title
    ? siteSeoDefaults.titleTemplate.replace('%s', title)
    : siteSeoDefaults.defaultTitle

  const description =
    base.description?.trim() || siteSeoDefaults.defaultDescription
  const imagePath = base.image?.trim() || siteSeoDefaults.defaultImage
  const normalizedBaseUrl = options?.baseUrl?.replace(/\/$/, '') || ''
  const image =
    normalizedBaseUrl && !/^https?:\/\//i.test(imagePath)
      ? new URL(imagePath, `${normalizedBaseUrl}/`).href
      : imagePath
  const type = base.type || siteSeoDefaults.defaultType
  const twitterCard = base.twitterCard || siteSeoDefaults.defaultTwitterCard

  // Canonical resolution
  let canonical = base.canonical?.trim()
  if (!canonical && options?.currentPath) {
    const baseUrl = options.baseUrl?.replace(/\/$/, '') || ''
    const path = options.currentPath.startsWith('/')
      ? options.currentPath
      : `/${options.currentPath}`
    canonical = baseUrl ? `${baseUrl}${path}` : path
  }

  // Robots resolution
  let robots: string | undefined
  if (base.noindex) {
    robots = 'noindex, nofollow'
  }

  // Keywords resolution
  let keywords: string | undefined
  if (Array.isArray(base.keywords)) {
    keywords = base.keywords.join(', ')
  } else if (typeof base.keywords === 'string') {
    keywords = base.keywords
  }

  return {
    title,
    fullTitle,
    description,
    image,
    type,
    twitterCard,
    canonical: canonical || undefined,
    robots,
    keywords,
    jsonLd: base.jsonLd
  }
}

/**
 * Single-line, reactive SEO composable for Nuxt pages and components.
 *
 * @example Preset key (1 line):
 * usePageSeo('termsOfService')
 *
 * @example Preset with overrides:
 * usePageSeo('termsOfService', { title: 'Terms & Conditions' })
 *
 * @example Custom object:
 * usePageSeo({ title: 'Pricing', description: 'Affordable yoga plans', noindex: true })
 *
 * @example Dynamic/reactive:
 * usePageSeo({
 *   title: () => offering.value?.name,
 *   description: () => offering.value?.description
 * })
 *
 * @example With explicit route or path (e.g. in middleware):
 * usePageSeo(to.meta.seo, undefined, to.path)
 */
export function usePageSeo(
  input?: SeoPresetKey | PageSeoInput | (() => PageSeoConfig),
  overrides?: PageSeoInput,
  routeOrPath?: PageSeoRouteInput
): ComputedRef<ResolvedSeoResult>
export function usePageSeo(
  input?: SeoPresetKey | PageSeoInput | (() => PageSeoConfig),
  routeOrPath?: PageSeoRouteInput
): ComputedRef<ResolvedSeoResult>
export function usePageSeo(
  input?: SeoPresetKey | PageSeoInput | (() => PageSeoConfig),
  overridesOrRoute?: PageSeoInput | PageSeoRouteInput,
  routeOrPath?: PageSeoRouteInput
): ComputedRef<ResolvedSeoResult> {
  let overrides: PageSeoInput | undefined
  let targetRouteOrPath: PageSeoRouteInput | undefined

  if (
    typeof overridesOrRoute === 'string' ||
    (overridesOrRoute &&
      'path' in overridesOrRoute &&
      !('title' in overridesOrRoute ||
        'description' in overridesOrRoute ||
        'image' in overridesOrRoute ||
        'canonical' in overridesOrRoute ||
        'noindex' in overridesOrRoute ||
        'keywords' in overridesOrRoute ||
        'twitterCard' in overridesOrRoute ||
        'jsonLd' in overridesOrRoute))
  ) {
    overrides = undefined
    targetRouteOrPath = overridesOrRoute
  } else {
    overrides = overridesOrRoute as PageSeoInput | undefined
    targetRouteOrPath = routeOrPath
  }

  let route: ReturnType<typeof useRoute> | undefined
  if (!targetRouteOrPath) {
    try {
      route = typeof useRoute === 'function' ? useRoute() : undefined
    } catch {
      route = undefined
    }
  }

  let runtimeConfig: ReturnType<typeof useRuntimeConfig> | undefined
  try {
    runtimeConfig =
      typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : undefined
  } catch {
    runtimeConfig = undefined
  }

  const resolved = computed(() => {
    const rawTarget = toValue(targetRouteOrPath)
    const explicitPath =
      typeof rawTarget === 'string' ? rawTarget : rawTarget?.path
    const currentPath = explicitPath ?? route?.path ?? ''
    const baseUrl =
      (runtimeConfig?.public?.baseUrl as string) ||
      (typeof window !== 'undefined' ? window.location.origin : '')

    return resolveSeoConfig(input, overrides, { currentPath, baseUrl })
  })

  // Register meta tags via Nuxt's useSeoMeta
  if (typeof useSeoMeta === 'function') {
    useSeoMeta({
      title: () => resolved.value.title || undefined,
      ogTitle: () => resolved.value.fullTitle,
      description: () => resolved.value.description,
      ogDescription: () => resolved.value.description,
      ogImage: () => resolved.value.image,
      ogType: () => resolved.value.type,
      ogSiteName: siteSeoDefaults.siteName,
      ogUrl: () => resolved.value.canonical || undefined,
      twitterCard: () => resolved.value.twitterCard,
      twitterTitle: () => resolved.value.fullTitle,
      twitterDescription: () => resolved.value.description,
      twitterImage: () => resolved.value.image,
      robots: () => resolved.value.robots
    })
  }

  // Register canonical link and custom tags via Nuxt's useHead
  if (typeof useHead === 'function') {
    useHead(() => {
      const links: { rel: 'canonical'; href: string }[] = []
      if (resolved.value.canonical) {
        links.push({ rel: 'canonical', href: resolved.value.canonical })
      }

      const meta: { name: string; content: string }[] = []
      if (resolved.value.keywords) {
        meta.push({ name: 'keywords', content: resolved.value.keywords })
      }

      const scripts: { type: 'application/ld+json'; innerHTML: string }[] = []
      if (resolved.value.jsonLd) {
        scripts.push({
          type: 'application/ld+json',
          innerHTML: JSON.stringify(resolved.value.jsonLd)
        })
      }

      return {
        title: resolved.value.title || undefined,
        link: links,
        meta,
        script: scripts
      }
    })
  }

  return resolved
}
