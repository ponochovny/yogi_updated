import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { user } from '~~/server/db/schema/auth-schema'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { eq, and, gt } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const offeringSlug = getRouterParam(event, 'offeringSlug')

	const db = useDb()

	try {
		// 1. Find the offering by slug
		const [offering] = await db
			.select({ id: offerings.id })
			.from(offerings)
			.where(eq(offerings.slug, offeringSlug!))
			.limit(1)

		if (!offering)
			throw createError({ statusCode: 404, message: 'Offering not found' })

		// 2. Fetch future ACTIVE slots with coach info
		const now = new Date()

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
			.where(
				and(
					eq(offeringSlots.offeringId, offering.id),
					eq(offeringSlots.status, 'ACTIVE'),
					gt(offeringSlots.startTime, now), // Only future slots
				),
			)
			.orderBy(offeringSlots.startTime)

		return slots
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: (error as Error).message,
		})
	}
})
