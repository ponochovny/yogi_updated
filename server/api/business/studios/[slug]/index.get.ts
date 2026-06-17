import { studios, studioLocations } from '~~/server/db/schema/studio'
import { mediaFiles, MediaTypeEnum } from '~~/server/db/schema/_other'
import { and, eq } from 'drizzle-orm'
import { useDb } from '~~/server/utils/db'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	const access = await checkStudioAccess(currentUserId, slug, [
		userRoles.BUSINESS,
		userRoles.MANAGER,
		userRoles.PRACTITIONER,
	])

	const [studio] = await db
		.select()
		.from(studios)
		.where(eq(studios.id, access.studioId))
		.limit(1)
	if (!studio) {
		throwApiError(
			404,
			'Studio not found or you do not have permission to view it',
		)
	}

	try {
		const [locations, media] = await Promise.all([
			db
				.select()
				.from(studioLocations)
				.where(eq(studioLocations.studioId, studio.id)),
			db
				.select()
				.from(mediaFiles)
				.where(
					and(
						eq(mediaFiles.entityId, studio.id),
						eq(mediaFiles.entityType, 'STUDIO'),
					),
				)
				.orderBy(mediaFiles.order),
		])

		const logo = media.find((file) => file.type === MediaTypeEnum.LOGO) || null
		const gallery = media.filter((file) => file.type === MediaTypeEnum.GALLERY)

		return {
			success: true,
			studio: {
				...studio,
				locations,
				logo: logo
					? { url: logo.url, providerPublicId: logo.providerPublicId }
					: null,
				gallery: gallery.map((file) => ({
					url: file.url,
					providerPublicId: file.providerPublicId,
				})),
			},
		}
	} catch (error) {
		if (isApiError(error)) throw error
		console.error('Failed to fetch studio details', error)
		throwApiError(500, 'Failed to fetch studio details')
	}
})
