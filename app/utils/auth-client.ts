import { createAuthClient } from 'better-auth/vue'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '~~/server/utils/auth' // Import the auth instance as a type

export const authClient = createAuthClient(
  import.meta.env.VITE_BASE_URL
    ? {
        baseURL: `${import.meta.env.VITE_BASE_URL}/api/auth`,
        plugins: [inferAdditionalFields<typeof auth>()],
        sessionOptions: {
          refetchOnWindowFocus: false, // Disable refresh on tab focus
          refetchInterval: 0, // Disable polling (default: 0)
          refetchWhenOffline: false // Disable when offline (default: false)
        }
      }
    : undefined
)

export const { signIn, signUp, signOut, useSession, getAccessToken } =
  authClient
