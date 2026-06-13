import { offerings } from '~~/server/db/schema/offering'
import { studios, studioLocations } from '~~/server/db/schema/studio'
import {
	MediaEntityTypeEnum,
	mediaFiles,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'
import { aliasedTable, and, eq, sql } from 'drizzle-orm'
import { getEntityGallery } from '~~/server/utils/db-helpers'

export default defineEventHandler(async () => {
	const db = useDb()

	const studioLogo = aliasedTable(mediaFiles, 'studio_logo')

	try {
		const data = await db
			.select({
				id: offerings.id,
				name: offerings.name,
				slug: offerings.slug,
				description: offerings.description,
				activityType: offerings.activityType,
				duration: offerings.duration,
				capacity: offerings.capacity,

				gallery: getEntityGallery(
					offerings.id,
					MediaEntityTypeEnum.OFFERING,
					MediaTypeEnum.GALLERY,
				),

				studio: {
					name: studios.name,
					slug: studios.slug,
					logo: studioLogo.url,
				},
				location: {
					name: studioLocations.name,
					city: studioLocations.city,
					country: studioLocations.country,
					address: studioLocations.address,
				},
			})
			.from(offerings)
			.innerJoin(studios, eq(offerings.studioId, studios.id))
			.leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
			.leftJoin(
				studioLogo,
				and(
					eq(studioLogo.entityId, sql`${studios.id}::text`),
					eq(studioLogo.entityType, MediaEntityTypeEnum.STUDIO),
					eq(studioLogo.type, MediaTypeEnum.LOGO),
				),
			)
			.where(eq(offerings.isPublished, true))

		return { success: true, offerings: data }
	} catch (error) {
		if (isApiError(error)) throw error
		console.error('Failed to fetch offerings', error)
		throwApiError(500, 'Failed to fetch offerings')
	}
})
