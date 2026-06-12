import { offerings, offeringSlots } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'
import { updateSlotsSchema } from '~/entities/slots/schema'

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
	const offeringSlug = getRouterParam(event, 'offeringSlug')
	if (!slug || !offeringSlug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Studio slug and offering slug are required',
		})
	}

	const currentUserId = session.user.id
	const db = useDb()

	// Check if studio exists and the user is it's owner
	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)
	if (!studio) {
		throw createError({
			statusCode: 404,
			statusMessage: "Studio is not found or you don't have permissions",
		})
	}

	// Verify the offering exists and belongs to the studio
	const [offering] = await db
		.select()
		.from(offerings)
		.where(
			and(eq(offerings.slug, offeringSlug), eq(offerings.studioId, studio.id)),
		)
		.limit(1)
	if (!offering) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Offering not found',
		})
	}

	const body = await readValidatedBody(event, updateSlotsSchema.parse)

	try {
		const [updatedSlot] = await db
			.update(offeringSlots)
			.set({
				status: body.status,
				practitionerId: body.practitionerId,
				capacityOverride: body.capacityOverride,
			})
			.where(
				and(
					eq(offeringSlots.offeringId, offering.id),
					eq(offeringSlots.id, body.id),
				),
			)
			.returning({
				id: offeringSlots.id,
				startTime: offeringSlots.startTime,
				endTime: offeringSlots.endTime,
				status: offeringSlots.status,
				practitionerId: offeringSlots.practitionerId,
				capacityOverride: offeringSlots.capacityOverride,
			})

		if (!updatedSlot) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Time slot not found',
			})
		}

		return { success: true, updatedSlot }
	} catch (error) {
		console.error('Offering update failed:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to update offering',
		})
	}
})
