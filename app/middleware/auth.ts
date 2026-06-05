export default defineNuxtRouteMiddleware(async (to, _) => {
	const localeRoute = useLocaleRoute()
	const route = localeRoute({
		path: '/login',
		query: { redirect: to.fullPath },
	})

	let session = null

	if (import.meta.server) {
		const headers = useRequestHeaders(['cookie']) as Record<string, string>
		try {
			session = await $fetch('/api/auth/get-session', { headers })
			// const { auth } = await import('@/../server/utils/auth')
			// const res = await $auth.api.getSession({ headers })
			// session = res?.session ?? null
		} catch {
			session = null
		}
	} else {
		const { useSession } = await import('~/utils/auth-client')
		const clientSession = useSession()

		if (clientSession.value.isPending) {
			await new Promise<void>((resolve) => {
				const stop = watch(
					() => clientSession.value.isPending,
					(pending) => {
						if (!pending) {
							stop()
							resolve()
						}
					},
				)
			})
		}

		session = clientSession.value.data ?? null
	}

	// @ts-expect-error: user field
	if (!session || !session.user) {
		return navigateTo(route.fullPath)
	}
})
