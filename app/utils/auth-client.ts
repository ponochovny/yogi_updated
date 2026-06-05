import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient(
	import.meta.env.VITE_BASE_URL
		? {
				baseURL: `${import.meta.env.VITE_BASE_URL}/api/auth`,
			}
		: undefined,
)

export const { signIn, signUp, signOut, useSession, getAccessToken } =
	authClient
