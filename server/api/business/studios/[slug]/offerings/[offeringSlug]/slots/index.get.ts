import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { user } from '~~/server/db/schema/auth-schema'
import { studioPractitioners, studios } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const offeringSlug = requireRouteParam(event, 'offeringSlug')
	const currentUserId = userData.id
	const db = useDb()

	// Verify the studio exists and belongs to the current user
	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)
	if (!studio) {
		throwApiError(
			404,
			'Studio not found or you do not have permission to edit this offering',
		)
	}

	// Verify the offering exists and belongs to the studio
	const [offering] = await db
		.select({ id: offerings.id })
		.from(offerings)
		.where(
			and(eq(offerings.slug, offeringSlug), eq(offerings.studioId, studio.id)),
		)
		.limit(1)
	if (!offering) {
		throwApiError(404, 'Offering not found')
	}

	try {
		// 2. Fetch slots with coach info
		const slots = await db
			.select({
				id: offeringSlots.id,
				startTime: offeringSlots.startTime,
				endTime: offeringSlots.endTime,
				status: offeringSlots.status,
				practitioner: {
					id: studioPractitioners.id,
					name: user.name,
				},
			})
			.from(offeringSlots)
			.innerJoin(
				studioPractitioners,
				eq(offeringSlots.practitionerId, studioPractitioners.id),
			)
			.innerJoin(user, eq(studioPractitioners.userId, user.id))
			.where(eq(offeringSlots.offeringId, offering.id))
			.orderBy(offeringSlots.startTime)

		return { success: true, slots }
	} catch (error) {
		if (isApiError(error)) throw error
		throwApiError(500, 'Failed to fetch slots', {
			detail: getErrorMessage(error),
		})
	}
})
