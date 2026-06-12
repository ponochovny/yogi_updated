import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots, offerings } from '~~/server/db/schema/offering'
import { eq, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const db = useDb()

	const session = await auth.api.getSession({
		headers: event.headers,
	})
	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized access',
		})
	}

	const slotId = getRouterParam(event, 'slotId')
	if (!slotId) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Slot ID is required',
		})
	}

	const clientId = session.user.id

	try {
		// 2. Open a database transaction to prevent double-booking (Race Condition)
		return await db.transaction(async (tx) => {
			// Lock the slot row for update (if NeonDB supports it seamlessly, or just rely on quick sequential checks)
			// Fetch the slot and its parent offering to determine maximum capacity
			const [slotData] = await tx
				.select({
					slotId: offeringSlots.id,
					slotStatus: offeringSlots.status,
					slotOverrideCapacity: offeringSlots.capacityOverride,
					offeringCapacity: offerings.capacity,
				})
				.from(offeringSlots)
				.innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
				.where(eq(offeringSlots.id, slotId))
				.limit(1)

			if (!slotData) {
				throw createError({ statusCode: 404, statusMessage: 'Slot not found' })
			}

			if (slotData.slotStatus !== 'ACTIVE') {
				throw createError({
					statusCode: 400,
					statusMessage: 'This session is not available for booking',
				})
			}

			// Determine actual capacity
			const maxCapacity =
				slotData.slotOverrideCapacity || slotData.offeringCapacity

			// 3. Count existing active bookings for this specific slot
			const [bookingsCount] = await tx
				.select({ count: sql<number>`cast(count(${bookings.id}) as int)` })
				.from(bookings)
				.where(
					and(eq(bookings.slotId, slotId!), eq(bookings.status, 'CONFIRMED')),
				)

			if (!bookingsCount) {
				throw createError({
					statusCode: 500,
					statusMessage: 'Failed to retrieve booking count',
				})
			}
			// 4. Capacity Check
			// If capacity is null/0, we assume unlimited. Otherwise, check limits.
			if (maxCapacity && bookingsCount.count >= maxCapacity) {
				throw createError({
					statusCode: 400,
					statusMessage: 'This session is fully booked',
				})
			}

			// 5. Prevent double booking by the same user
			const [existingBooking] = await tx
				.select({ id: bookings.id })
				.from(bookings)
				.where(
					and(
						eq(bookings.slotId, slotId),
						eq(bookings.userId, clientId),
						eq(bookings.status, 'CONFIRMED'),
					),
				)
				.limit(1)

			if (existingBooking) {
				throw createError({
					statusCode: 400,
					statusMessage: 'You have already booked this session',
				})
			}

			// 6. Create the booking
			const [newBooking] = await tx
				.insert(bookings)
				.values({
					slotId: slotId,
					userId: clientId,
					status: 'CONFIRMED',
				})
				.returning({ id: bookings.id })

			if (!newBooking) {
				throw createError({
					statusCode: 500,
					statusMessage: 'Failed to create booking',
				})
			}

			return {
				success: true,
				bookingId: newBooking.id,
			}
		})
	} catch (error) {
		if (error && typeof error === 'object' && 'statusCode' in error) {
			throw error
		}
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to book the session',
		})
	}
})
