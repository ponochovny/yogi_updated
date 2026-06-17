import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import {
	studios,
	studioMembers,
	studioPractitioners,
} from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { eq, and, inArray, sql } from 'drizzle-orm'
import { userRoles } from '~~/server/auth/config'
import { bookings } from '~~/server/db/schema/booking'
import { BookingStatus } from '~/entities/booking/schema'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({ headers: event.headers })
	if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

	const query = getQuery(event)
	const slug = query.studioSlug as string | undefined

	const db = useDb()

	// Basic conditions: current user must be a Manager or Owner in the studio
	const conditions = [
		eq(studioMembers.userId, session.user.id),
		inArray(studioMembers.role, [userRoles.MANAGER, userRoles.BUSINESS]),
	]

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
			offering: {
				id: offerings.id,
				name: offerings.name,
			},
			studio: {
				id: studios.id,
				name: studios.name,
				slug: studios.slug,
			},
			// Manger have to see the name of the practitioner for each slot
			practitioner: {
				id: studioPractitioners.id,
				name: user.name,
				image: user.image,
			},
		})
		.from(offeringSlots)
		.innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
		.innerJoin(studios, eq(offerings.studioId, studios.id))
		// Binding a studio member to a studio to check their role
		.innerJoin(studioMembers, eq(studios.id, studioMembers.studioId))
		// Binding a trainer to a slot
		.innerJoin(
			studioPractitioners,
			eq(offeringSlots.practitionerId, studioPractitioners.id),
		)
		.innerJoin(user, eq(studioPractitioners.userId, user.id))
		.where(and(...conditions))
		.orderBy(offeringSlots.startTime)

	return slots
})
