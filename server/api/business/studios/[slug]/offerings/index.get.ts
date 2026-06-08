import { offerings } from '~~/server/utils/db/schema/offering'
import { studios, studioLocations } from '~~/server/utils/db/schema/studio'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({
		headers: event.headers,
	})

	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized access',
		})
	}

	// VALIDATING SLUG PARAMETER
	const slug = getRouterParam(event, 'slug')
	if (!slug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Studio slug is required',
		})
	}

	const currentUserId = session.user.id
	const db = useDb()

	try {
		const [studio] = await db
			.select()
			.from(studios)
			.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
			.limit(1)

		if (!studio) {
			throw createError({
				statusCode: 404,
				message: 'Studio not found or you do not have permission to view it',
			})
		}

		const data = await db
			.select({
				id: offerings.id,
				name: offerings.name,
				activityType: offerings.activityType,
				duration: offerings.duration,
				isPublished: offerings.isPublished,
				location: {
					name: studioLocations.name,
					country: studioLocations.country,
					city: studioLocations.city,
					address: studioLocations.address,
				},
			})
			.from(offerings)
			.leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
			.where(eq(offerings.studioId, studio.id))

		return { success: true, offerings: data }
	} catch (error) {
		throw createError({ statusCode: 500, message: (error as Error).message })
	}
})
