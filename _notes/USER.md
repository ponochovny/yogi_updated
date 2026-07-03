# User tools

## Get user role

```TS
// server/utils/auth/index.ts
import { useDb } from '../db'

export const auth = betterAuth({
	plugins: [
		customSession(async ({ user, session }) => {
			const db = useDb()

			const workspaces = await db
				.select({
					role: studioMembers.role,
					studio: {
						id: studios.id,
						slug: studios.slug,
						name: studios.name,
					},
				})
				.from(studioMembers)
				.innerJoin(studios, eq(studios.id, studioMembers.studioId))
				.where(eq(studioMembers.userId, user.id))

			return {
				...session,
				user: {
					...user,
					workspaces,
				},
			}
		}
	]
})

// app/page/index.vue
const { userData, getRolesInStudio } = useUserData()

const allRoles = userData.value.roles
const studioRoles = getRolesInStudio(route.params.slug as string)
```

## Check user authentication and access

```TS
const userData = await requireAuthenticatedUser(event)
const slug = requireRouteParam(event, 'slug')
const db = useDb()

try {
	const access = await checkStudioAccess(userData.id, slug, [
		userRoles.BUSINESS,
		userRoles.MANAGER
	])

	const [studio] = await db
		.select()
		.from(studios)
		.where(eq(studios.id, access.studioId))
		.limit(1)
	if (!studio) {
		throwApiError(404, 'Studio not found')
	}
	// ...
```
