import type { PageSeoInput, SeoPresetKey } from '~/config/seo.config'

declare module '#app' {
  interface PageMeta {
    /**
     * Concise SEO configuration or preset key for this page.
     * @example seo: 'termsOfService'
     * @example seo: { title: 'Terms of Service', description: '...' }
     */
    seo?: SeoPresetKey | PageSeoInput
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Concise SEO configuration or preset key for this page.
     * @example seo: 'termsOfService'
     * @example seo: { title: 'Terms of Service', description: '...' }
     */
    seo?: SeoPresetKey | PageSeoInput
  }
}

export {}
