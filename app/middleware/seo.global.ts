export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.seo) {
    usePageSeo(to.meta.seo)
  }
})
