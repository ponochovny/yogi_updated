import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots } from '~~/server/db/schema/offering'
import { eq, and } from 'drizzle-orm'
import { BookingStatus } from '~/entities/booking/schema'

export default defineEventHandler(async (event) => {
	const user = await requireAuthenticatedUser(event)
	const bookingId = requireRouteParam(event, 'bookingId')
	const db = useDb()
	const userId = user.id

	const [booking] = await db
		.select({
			id: bookings.id,
			status: bookings.status,
			slotStartTime: offeringSlots.startTime,
		})
		.from(bookings)
		.innerJoin(offeringSlots, eq(bookings.slotId, offeringSlots.id))
		.where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
		.limit(1)

	if (!booking) throwApiError(404, 'Booking not found')

	if (booking.status === BookingStatus.CANCELLED)
		throwApiError(400, 'Already cancelled')

	if (new Date(booking.slotStartTime) < new Date()) {
		throwApiError(400, 'Cannot cancel a past class')
	}

	try {
		await db
			.update(bookings)
			.set({ status: BookingStatus.CANCELLED, updatedAt: new Date() })
			.where(eq(bookings.id, bookingId))

		return { success: true, message: 'Booking cancelled successfully' }
	} catch (error) {
		if (isApiError(error)) throw error
		console.error('Failed to cancel the booking', error)
		throwApiError(500, 'Failed to cancel booking')
	}
})
