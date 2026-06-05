import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient({
	baseURL: `${import.meta.env.VITE_BASE_URL}/api/auth`,
})

export const { signIn, signUp, signOut, useSession, getAccessToken } =
	authClient
