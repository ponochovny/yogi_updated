import { createAuthClient } from 'better-auth/vue'
import {
  customSessionClient,
  inferAdditionalFields
} from 'better-auth/client/plugins'
import type { auth } from '~~/server/utils/auth' // Import the auth instance as a type

const authClientPlugins = [
  inferAdditionalFields<typeof auth>(),
  customSessionClient<typeof auth>()
]

export const authClient = createAuthClient({
  ...(import.meta.env.VITE_BASE_URL
    ? {
        baseURL: `${import.meta.env.VITE_BASE_URL}/api/auth`
      }
    : {}),
  plugins: authClientPlugins,
  sessionOptions: {
    refetchOnWindowFocus: false, // Disable refresh on tab focus
    refetchInterval: 0, // Disable polling (default: 0)
    refetchWhenOffline: false // Disable when offline (default: false)
  }
})

export const { signIn, signUp, signOut, useSession, getAccessToken } =
  authClient
