export default defineNuxtRouteMiddleware(async (to, _) => {
	const localeRoute = useLocaleRoute()

	const headers = useRequestHeaders(['cookie']) as Record<string, string>
	let session = null
	session = await $fetch('/api/auth/get-session', { headers })

	// TEST LOGS
	// console.log(
	// 	import.meta.client ? '[CLIENT]' : '[SERVER]',
	// 	'Auth middleware executed',
	// )
	// console.log('Session data:', session)

	const route = localeRoute({
		path: '/login',
		query: { redirect: to.fullPath },
	})

	if (!session) {
		return navigateTo(route.fullPath)
	}
})
