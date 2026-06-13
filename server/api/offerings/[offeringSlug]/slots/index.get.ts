import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { user } from '~~/server/db/schema/auth-schema'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const offeringSlug = requireRouteParam(event, 'offeringSlug')

	const db = useDb()

	// 1. Find the offering by slug
	const [offering] = await db
		.select({ id: offerings.id })
		.from(offerings)
		.where(
			and(eq(offerings.slug, offeringSlug), eq(offerings.isPublished, true)),
		)
		.limit(1)
	if (!offering) throwApiError(404, 'Offering not found')

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
		throwApiError(500, 'Failed to fetch offering slots', {
			detail: getErrorMessage(error),
		})
	}
})
