import { studios, studioMembers } from '~~/server/db/schema/studio'
import { eq } from 'drizzle-orm'
import { useDb } from '~~/server/utils/db'

// Take list of member's studios list with their name, slug, logo. Only return studios where the user is a member.
export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const currentUserId = userData.id
	const db = useDb()

	try {
		const userStudios = await db
			.select({
				id: studios.id,
				slug: studios.slug,
				name: studios.name,
				role: studioMembers.role,
			})
			.from(studioMembers)
			.innerJoin(studios, eq(studioMembers.studioId, studios.id))
			.where(eq(studioMembers.userId, currentUserId))

		return {
			success: true,
			studios: userStudios,
		}
	} catch (error) {
		if (isApiError(error)) throw error
		console.error('Failed to fetch studios', error)
		throwApiError(500, 'Failed to fetch studios')
	}
})
