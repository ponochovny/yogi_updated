export default defineNuxtRouteMiddleware(async (to, from) => {
	const localeRoute = useLocaleRoute()
	const { data: session } = await authClient.useSession(useFetch)

	const route = localeRoute({
		path: '/login',
		query: { redirect: to.fullPath },
	})

	if (!session.value) {
		return navigateTo(route.fullPath)
	}
})
