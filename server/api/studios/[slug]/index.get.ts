import { studios, studioLocations } from '~~/server/db/schema/studio'
import {
	MediaEntityTypeEnum,
	mediaFiles,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const slug = requireRouteParam(event, 'slug')

	const db = useDb()

	try {
		const [studio] = await db
			.select()
			.from(studios)
			.where(eq(studios.slug, slug))
			.limit(1)

		if (!studio) {
			throwApiError(404, 'Studio not found')
		}

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
						eq(mediaFiles.entityType, MediaEntityTypeEnum.STUDIO),
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
		console.error('Failed to fetch studio', error)
		throwApiError(500, 'Failed to fetch studio')
	}
})
