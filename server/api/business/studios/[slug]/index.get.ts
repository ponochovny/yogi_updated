import { studios, studioLocations } from '~~/server/utils/db/schema/studio'
import { mediaFiles } from '~~/server/utils/db/schema/_other'
import { and, eq } from 'drizzle-orm'

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
	const slug = getRouterParam(event, 'slug')

	if (!slug) {
		throw createError({ statusCode: 400, message: 'Slug is required' })
	}

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

	const logo = media.find((file) => file.type === 'LOGO') || null
	const gallery = media.filter((file) => file.type === 'GALLERY')

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
})
