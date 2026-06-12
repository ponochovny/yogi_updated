import { studios, studioLocations } from '~~/server/db/schema/studio'
import { mediaFiles, MediaTypeEnum } from '~~/server/db/schema/_other'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({
		headers: event.headers,
	})
	// AUTHENTICATION CHECK
	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized access',
		})
	}

	const slug = getRouterParam(event, 'slug')
	// VALIDATING SLUG PARAMETER
	if (!slug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Slug is required',
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
				statusMessage:
					'Studio not found or you do not have permission to view it',
			})
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
		if (error && typeof error === 'object' && 'statusCode' in error) {
			throw error
		}
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to get studio details',
		})
	}
})
