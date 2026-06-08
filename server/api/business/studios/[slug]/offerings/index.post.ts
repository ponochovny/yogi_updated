import { offerings, offeringPractitioners } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'
import { createOfferingSchema } from '~/entities/offering/schema'
import slugify from 'slugify'
import { MediaEntityTypeEnum } from '~~/server/db/schema/_other'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({
		headers: event.headers,
	})

	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized access',
		})
	}

	// VALIDATING SLUG PARAMETER
	const slug = getRouterParam(event, 'slug')
	if (!slug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Slug is required',
		})
	}

	const currentUserId = session.user.id
	const db = useDb()

	const body = await readValidatedBody(event, createOfferingSchema.parse)

	const offeringSlug = `${slugify(body.name, { lower: true })}-${Math.floor(1000 + Math.random() * 9000)}`

	try {
		const result = await db.transaction(async (tx) => {
			// 1. Check if studio exists and the user is it's owner
			const [studio] = await tx
				.select()
				.from(studios)
				.where(and(eq(studios.slug, slug!), eq(studios.ownerId, currentUserId)))
				.limit(1)

			if (!studio) {
				throw createError({
					statusCode: 404,
					message: "Studio is not found or you don't have permissions",
				})
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
					isPublished: true,
				})
				.returning()

			if (!newOffering)
				throw createError({
					statusCode: 500,
					message: 'Offering creation error',
				})

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
		throw createError({ statusCode: 500, message: (error as Error).message })
	}
})
