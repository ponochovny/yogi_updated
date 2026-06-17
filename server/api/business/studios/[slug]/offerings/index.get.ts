import { offerings } from '~~/server/db/schema/offering'
import { studios, studioLocations } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	await checkStudioAccess(currentUserId, slug, [
		userRoles.BUSINESS,
		userRoles.MANAGER,
		userRoles.PRACTITIONER,
	])

	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)
	if (!studio) {
		throwApiError(
			404,
			'Studio not found or you do not have permission to view it',
		)
	}

	try {
		const data = await db
			.select({
				id: offerings.id,
				slug: offerings.slug,
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
		if (isApiError(error)) throw error
		console.error('Failed to fetch offerings', error)
		throwApiError(500, 'Failed to fetch offerings')
	}
})
