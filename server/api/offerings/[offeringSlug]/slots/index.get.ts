import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { user } from '~~/server/db/schema/auth-schema'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const offeringSlug = getRouterParam(event, 'offeringSlug')
	if (!offeringSlug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Offering slug is required',
		})
	}

	const db = useDb()

	try {
		// 1. Find the offering by slug
		const [offering] = await db
			.select({ id: offerings.id })
			.from(offerings)
			.where(
				and(eq(offerings.slug, offeringSlug), eq(offerings.isPublished, true)),
			)
			.limit(1)

		if (!offering)
			throw createError({ statusCode: 404, message: 'Offering not found' })

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
		if (error && typeof error === 'object' && 'statusCode' in error) {
			throw error
		}
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to fetch offering slots',
		})
	}
})
