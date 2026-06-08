import { offerings } from '~~/server/utils/db/schema/offering'
import { studios, studioLocations } from '~~/server/utils/db/schema/studio'
import { mediaFiles } from '~~/server/utils/db/schema/_other'
import { aliasedTable, and, eq } from 'drizzle-orm'
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

				gallery: getEntityGallery(offerings.id, 'OFFERING', 'GALLERY'),

				studio: {
					name: studios.name,
					slug: studios.slug,
					logo: studioLogo.url,
				},
				location: {
					name: studioLocations.name,
					city: studioLocations.city,
					address: studioLocations.address,
				},
			})
			.from(offerings)
			.innerJoin(studios, eq(offerings.studioId, studios.id))
			.leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
			.leftJoin(
				studioLogo,
				and(
					eq(studioLogo.entityId, studios.id),
					eq(studioLogo.entityType, 'STUDIO'),
					eq(studioLogo.type, 'LOGO'),
				),
			)
			.where(eq(offerings.isPublished, true))

		return { success: true, offerings: data }
	} catch (error) {
		throw createError({ statusCode: 500, message: (error as Error).message })
	}
})
