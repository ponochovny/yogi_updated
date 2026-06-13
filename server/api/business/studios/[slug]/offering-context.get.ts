import {
	studios,
	studioPractitioners,
	studioLocations,
} from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	try {
		// 1. Check if studio exists and the user is it's owner
		const [studio] = await db
			.select()
			.from(studios)
			.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
			.limit(1)
		if (!studio) {
			throwApiError(404, "Studio is not found or you don't have permissions")
		}

		// 2. Additional data
		const [practitioners, locations] = await Promise.all([
			db
				.select({
					id: studioPractitioners.id,
					name: user.name,
					email: user.email,
					avatar: user.image,
				})
				.from(studioPractitioners)
				.innerJoin(user, eq(studioPractitioners.userId, user.id))
				.where(
					and(
						eq(studioPractitioners.studioId, studio.id),
						eq(studioPractitioners.salaryActive, true),
					),
				),

			db
				.select()
				.from(studioLocations)
				.where(eq(studioLocations.studioId, studio.id)),
		])

		return {
			success: true,
			studio: {
				id: studio.id,
				locations,
				practitioners,
			},
		}
	} catch (error: unknown) {
		if (isApiError(error)) throw error
		console.error('Failed to fetch offering context', error)
		throwApiError(500, 'Failed to fetch offering context')
	}
})
