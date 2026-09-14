import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { resolveSeoConfig } from '../../app/composables/usePageSeo'
import { pageSeoPresets, siteSeoDefaults } from '../../app/config/seo.config'

describe('resolveSeoConfig', () => {
  it('resolves preset by key correctly', () => {
    const result = resolveSeoConfig('termsOfService')

    expect(result.title).toBe(pageSeoPresets.termsOfService.title)
    expect(result.fullTitle).toBe(
      `${pageSeoPresets.termsOfService.title} · Yogi App`
    )
    expect(result.description).toBe(
      pageSeoPresets.termsOfService.description
    )
    expect(result.image).toBe(siteSeoDefaults.defaultImage)
    expect(result.type).toBe('website')
    expect(result.twitterCard).toBe('summary_large_image')
    expect(result.robots).toBeUndefined()
  })

  it('resolves preset with overrides', () => {
    const result = resolveSeoConfig('termsOfService', {
      title: 'Custom Terms',
      description: 'Overridden description'
    })

    expect(result.title).toBe('Custom Terms')
    expect(result.fullTitle).toBe('Custom Terms · Yogi App')
    expect(result.description).toBe('Overridden description')
  })

  it('resolves noindex flag correctly for private routes', () => {
    const result = resolveSeoConfig('checkoutSuccess')

    expect(result.title).toBe(pageSeoPresets.checkoutSuccess.title)
    expect(result.robots).toBe('noindex, nofollow')
  })

  it('handles custom plain object input', () => {
    const result = resolveSeoConfig({
      title: 'Special Workshop',
      description: 'Breathwork & Meditation',
      image: '/images/workshop.jpg',
      type: 'article',
      keywords: ['yoga', 'workshop', 'meditation']
    })

    expect(result.title).toBe('Special Workshop')
    expect(result.fullTitle).toBe('Special Workshop · Yogi App')
    expect(result.description).toBe('Breathwork & Meditation')
    expect(result.image).toBe('/images/workshop.jpg')
    expect(result.type).toBe('article')
    expect(result.keywords).toBe('yoga, workshop, meditation')
  })

  it('handles reactive Vue refs and getters', () => {
    const dynamicTitle = ref('Dynamic Offering Title')
    const dynamicDesc = ref('Dynamic Description')

    const result = resolveSeoConfig({
      title: () => dynamicTitle.value,
      description: dynamicDesc
    })

    expect(result.title).toBe('Dynamic Offering Title')
    expect(result.fullTitle).toBe('Dynamic Offering Title · Yogi App')
    expect(result.description).toBe('Dynamic Description')
  })

  it('resolves canonical URL with baseUrl and currentPath', () => {
    const result = resolveSeoConfig(
      'home',
      null,
      {
        currentPath: '/terms-of-service',
        baseUrl: 'https://yogi.app'
      }
    )

    expect(result.canonical).toBe('https://yogi.app/terms-of-service')
  })

  it('preserves custom canonical URL if explicitly provided', () => {
    const result = resolveSeoConfig({
      title: 'Canonical Test',
      canonical: 'https://custom-domain.com/canonical-url'
    }, null, {
      currentPath: '/some-other-path',
      baseUrl: 'https://yogi.app'
    })

    expect(result.canonical).toBe('https://custom-domain.com/canonical-url')
  })

  it('falls back gracefully on empty or null input', () => {
    const result = resolveSeoConfig(null)

    expect(result.title).toBe('')
    expect(result.fullTitle).toBe(siteSeoDefaults.defaultTitle)
    expect(result.description).toBe(siteSeoDefaults.defaultDescription)
    expect(result.image).toBe(siteSeoDefaults.defaultImage)
    expect(result.robots).toBeUndefined()
  })
})
