import { createAuthClient } from 'better-auth/vue'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from '~~/server/utils/auth' // Import the auth instance as a type

export const authClient = createAuthClient(
  import.meta.env.VITE_BASE_URL
    ? {
        baseURL: `${import.meta.env.VITE_BASE_URL}/api/auth`,
        plugins: [inferAdditionalFields<typeof auth>()]
      }
    : undefined
)

export const { signIn, signUp, signOut, useSession, getAccessToken } =
  authClient
