import { offerings, offeringPractitioners } from '~~/server/db/schema/offering'
import {
	studioLocations,
	studioPractitioners,
	studios,
} from '~~/server/db/schema/studio'
import { and, eq, inArray } from 'drizzle-orm'
import { createOfferingSchema } from '~/entities/offering/schema'
import slugify from 'slugify'
import {
	MediaEntityTypeEnum,
	mediaFiles,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	const body = await readValidatedBody(event, createOfferingSchema.parse)

	const offeringSlug = `${slugify(body.name, { lower: true })}-${Math.floor(1000 + Math.random() * 9000)}`

	// 1. Check if studio exists and the user is it's owner
	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)

	if (!studio) {
		throwApiError(404, "Studio is not found or you don't have permissions")
	}

	try {
		const result = await db.transaction(async (tx) => {
			// 1.1 Validations
			if (body.locationId) {
				const [location] = await tx
					.select({ id: studioLocations.id })
					.from(studioLocations)
					.where(
						and(
							eq(studioLocations.id, body.locationId),
							eq(studioLocations.studioId, studio.id),
						),
					)
					.limit(1)
				if (!location) {
					throwApiError(400, 'Invalid location for this studio')
				}
			}
			const validPractitioners = await tx
				.select({ id: studioPractitioners.id })
				.from(studioPractitioners)
				.where(
					and(
						eq(studioPractitioners.studioId, studio.id),
						inArray(studioPractitioners.id, body.practitionerIds),
					),
				)
			if (validPractitioners.length !== body.practitionerIds.length) {
				throwApiError(
					400,
					'One or more practitioners are invalid for this studio',
				)
			}

			// 2. Offering creation
			const [newOffering] = await tx
				.insert(offerings)
				.values({
					studioId: studio.id,
					slug: offeringSlug,
					name: body.name,
					description: body.description,
					activityType: body.activityType,
					isPrivate: body.isPrivate,
					locationId: body.locationId,
					timezone: body.timezone,
					duration: body.duration,
					capacity: body.capacity,
					isPublished: true, // TODO: temporary, as there is no "publish" flow for now. All offerings are published by default
				})
				.returning()

			if (!newOffering) throwApiError(500, 'Offering creation error')

			// 3. Add trainers
			const practitionersToInsert = body.practitionerIds.map(
				(practitionerId) => ({
					offeringId: newOffering.id,
					practitionerId: practitionerId,
				}),
			)
			await tx.insert(offeringPractitioners).values(practitionersToInsert)

			if (body.gallery && body.gallery.length > 0) {
				const galleryInserts = body.gallery.map(
					(
						image: { url: string; providerPublicId: string },
						index: number,
					) => ({
						url: image.url,
						providerPublicId: image.providerPublicId,
						entityId: newOffering.id,
						entityType: MediaEntityTypeEnum.OFFERING,
						type: MediaTypeEnum.GALLERY,
						order: index,
					}),
				)
				await tx.insert(mediaFiles).values(galleryInserts)
			}

			return newOffering
		})

		return { success: true, offering: result }
	} catch (error: unknown) {
		if (isApiError(error)) throw error
		throwApiError(500, 'Failed to create offering', {
			detail: getErrorMessage(error),
		})
	}
})
