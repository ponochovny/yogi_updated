import { auth } from '~~/server/utils/auth'
import { studios, studioLocations } from '~~/server/db/schema/studio'
import {
	mediaFiles,
	MediaEntityTypeEnum,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'
import { createStudioSchema } from '~/entities/studio/schema'
import slugify from 'slugify'

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

	const body = await readValidatedBody(event, createStudioSchema.parse)

	const currentUserId = session.user.id

	const studioSlug = `${slugify(body.name, { lower: true })}-${Math.floor(1000 + Math.random() * 9000)}`

	try {
		const result = await db.transaction(async (tx) => {
			const [newStudio] = await tx
				.insert(studios)
				.values({
					slug: studioSlug,
					name: body.name,
					currency: body.currency,
					bio: body.bio,
					mission: body.mission,
					categories: body.categories,
					types: body.types,
					ownerId: currentUserId,
				})
				.returning()

			if (newStudio) {
				const locationsToInsert = body.locations.map(
					(loc: {
						name: string
						country: string
						city: string
						address: string
						timezone: string
					}) => ({
						studioId: newStudio.id,
						name: loc.name,
						country: loc.country,
						city: loc.city,
						address: loc.address,
						timezone: loc.timezone,
					}),
				)
				await tx.insert(studioLocations).values(locationsToInsert)

				if (body.logo) {
					await tx.insert(mediaFiles).values({
						url: body.logo.url,
						providerPublicId: body.logo.providerPublicId,
						entityId: newStudio.id,
						entityType: MediaEntityTypeEnum.STUDIO,
						type: MediaTypeEnum.LOGO,
					})
				}

				if (body.gallery && body.gallery.length > 0) {
					const galleryInserts = body.gallery.map(
						(
							image: { url: string; providerPublicId: string },
							index: number,
						) => ({
							url: image.url,
							providerPublicId: image.providerPublicId,
							entityId: newStudio.id,
							entityType: MediaEntityTypeEnum.STUDIO,
							type: MediaTypeEnum.GALLERY,
							order: index,
						}),
					)
					await tx.insert(mediaFiles).values(galleryInserts)
				}
			}

			return newStudio
		})

		return { success: true, studio: result }
	} catch (error) {
		throw createError({
			statusCode: 500,
			message: (error as Error).message ?? 'Unknown error',
		})
	}
})
