## 📝Better Auth - Extend user fields

```TS
export const auth = betterAuth({
	// ... other options
	user: {
		// ... other options
		additionalFields: {
			role: {
				type: "string",
				required: false,
				defaultValue: "user",
			},
			phoneNumber: {
				type: "string",
				required: false
			}
		}
	}
})
```

## 📝Better Auth - Usage

```TS
// app/middleware/auth.js example

// GET SESSION DATA
// V3
// import { useSession } from '@/utils/auth-client'

// V4
// import {auth} from '@/../server/utils/auth'

// GET SESSION DATA
// V1
const { data: session } = await useFetch('/api/auth/get-session')

// V2
// const session = await useAsyncData('session', () => $fetch('/api/auth/get-session'))

// V3
// const session = useSession()

// V4
// const session = await auth.getSession()
// const session = await auth.api.getSession()

// V5
// const headers = useRequestHeaders(['cookie']) as Record<string, string>
// let session = null
// session = await $fetch('/api/auth/get-session', { headers })

// TEST LOGS
console.log(
	import.meta.client ? '[CLIENT]' : '[SERVER]',
	'Auth middleware executed',
)
console.log('Session data:', session)

```

## 📝Better Auth - User types

```TS
import type { user as DrizzleUser } from '~~/server/utils/db/schema/auth-schema'

const user = session.value?.data?.user as unknown as typeof DrizzleUser.$inferSelect
```
