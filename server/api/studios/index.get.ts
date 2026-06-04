import { studios, studioLocations, mediaFiles } from '../../utils/db/schema'
import { and, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const db = useDb()
	const session = await auth.api.getSession({
		headers: event.headers,
	})

	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized access',
		})
	}

	const currentUserId = session.user.id

	const userStudios = await db
		.select()
		.from(studios)
		.where(eq(studios.ownerId, currentUserId))

	if (!userStudios.length) {
		return { success: true, studios: [] }
	}

	const studioIds = userStudios.map((s) => s.id)

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
					sql`${mediaFiles.entityId} IN ${studioIds}`,
					eq(mediaFiles.entityType, 'STUDIO'),
					eq(mediaFiles.type, 'LOGO'),
				),
			),
	])

	const studiosWithDetails = userStudios.map((studio) => {
		const studioLocs = locations.filter((l) => l.studioId === studio.id)
		const logo = media.find((m) => m.entityId === studio.id)

		return {
			...studio,
			locationsCount: studioLocs.length,
			logoUrl: logo ? logo.url : null,
		}
	})

	return { success: true, studios: studiosWithDetails }
})
