import { studios, studioLocations } from '~~/server/db/schema/studio'
import {
	mediaFiles,
	MediaEntityTypeEnum,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'
import { createStudioSchema } from '~/entities/studio/schema'
import slugify from 'slugify'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const body = await readValidatedBody(event, createStudioSchema.parse)
	const currentUserId = userData.id
	const db = useDb()

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
		if (isApiError(error)) throw error
		console.error('Failed to create studio', error)
		throwApiError(500, 'Failed to create studio')
	}
})
