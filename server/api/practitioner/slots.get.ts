import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { eq, and, sql } from 'drizzle-orm'
import { bookings } from '~~/server/db/schema/booking'
import { BookingStatus } from '~/entities/booking/schema'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({ headers: event.headers })
	if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

	// We get an optional parameter from the URL, for example: /api/practitioner/slots?studioSlug=yoga-center
	const query = getQuery(event)
	const slug = query.studioSlug as string | undefined
	const db = useDb()

	// Basic conditions: the practitioner must be linked to the current user
	const conditions = [eq(studioPractitioners.userId, session.user.id)]

	// If the frontend requested a specific studio, we add a filter to the conditions array.
	if (slug) {
		conditions.push(eq(studios.slug, slug))
	}

	const slots = await db
		.select({
			id: offeringSlots.id,
			startTime: offeringSlots.startTime,
			endTime: offeringSlots.endTime,
			status: offeringSlots.status,
			capacity: sql<number>`COALESCE(${offeringSlots.capacityOverride}, ${offerings.capacity})`, // If capacityOverride is set, use it; otherwise, fall back to the offering's default capacity.
			bookedCount: sql<number>`(
				SELECT count(${bookings.id})::int
				FROM ${bookings}
				WHERE ${bookings.slotId} = ${offeringSlots.id}
				AND ${bookings.status} IN (
					${BookingStatus.CONFIRMED}, 
					${BookingStatus.ATTENDED}, 
					${BookingStatus.NO_SHOW}
				)
			)`,
			// We are collecting information about the offering
			offering: {
				id: offerings.id,
				name: offerings.name,
				slug: offerings.slug,
			},
			// We are collecting information about the studio
			studio: {
				id: studios.id,
				name: studios.name,
				slug: studios.slug,
			},
		})
		.from(offeringSlots)
		// 1. Binding a trainer to a slot
		.innerJoin(
			studioPractitioners,
			eq(offeringSlots.practitionerId, studioPractitioners.id),
		)
		// 2. Binding an offering to a slot
		.innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
		// 3. Binding a studio to an offering
		.innerJoin(studios, eq(offerings.studioId, studios.id))
		// We apply all our conditions
		.where(and(...conditions))
		.orderBy(offeringSlots.startTime) // Sort by time

	return slots
})
