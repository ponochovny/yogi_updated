import { studios, studioLocations } from '~~/server/utils/db/schema/studio'
import { mediaFiles } from '~~/server/utils/db/schema/_other'
import { and, eq, inArray, sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
	const db = useDb()

	const allStudios = await db
		.select()
		.from(studios)
		.where(eq(studios.isArchived, false))

	if (!allStudios.length) {
		return { success: true, studios: [] }
	}

	const studioIds = allStudios.map((s) => s.id)

	const [locations, media] = await Promise.all([
		db
			.select()
			.from(studioLocations)
			.where(sql`${studioLocations.studioId} IN ${studioIds}`),
		db
			.select()
			.from(mediaFiles)
			.where(
				and(
					inArray(mediaFiles.entityId, studioIds),
					eq(mediaFiles.entityType, 'STUDIO'),
				),
			),
	])

	const studiosWithDetails = allStudios.map((studio) => {
		const studioLocs = locations.filter((l) => l.studioId === studio.id)
		const studioMedia = media.filter((m) => m.entityId === studio.id)

		const logo = studioMedia.filter((m) => m.type === 'LOGO')[0]?.url || null
		const gallery = studioMedia
			.filter((m) => m.type === 'GALLERY')
			.map((m) => m.url)

		const studioLocationsFormatted = studioLocs.map((l) => ({
			address: l.address,
			city: l.city,
			country: l.country,
		}))

		return {
			...studio,
			logo,
			gallery,
			locations: studioLocationsFormatted,
		}
	})

	return { success: true, studios: studiosWithDetails }
})
