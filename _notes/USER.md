# User tools

## Get user role

``` TS
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
const session = useSession()
const user = computed(() => session.value?.data?.user || null)

const isPractitioner = computed(() =>
	user.value?.workspaces?.some((w) => w.role === userRoles.PRACTITIONER),
)
const isManager = computed(() =>
	user.value?.workspaces?.some((w) => [userRoles.MANAGER].includes(w.role)),
)
const isBusiness = computed(() =>
	user.value?.workspaces?.some((w) => [userRoles.BUSINESS].includes(w.role)),
)

// OR

const roles = computed(() => {
	// @ts-expect-error: workspaces field
	const workspaces = session.value?.data?.user.workspaces ?? []
	const { getRolesInStudio } = useWorkspaces(workspaces)
	return getRolesInStudio(route.params.slug as string)
})
```
