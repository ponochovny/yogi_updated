import { offeringSlots } from '~~/server/db/schema/offering'
import { bookings } from '~~/server/db/schema/booking'
import { eq } from 'drizzle-orm'
import { userRoles } from '~~/server/auth/config'
import { updateBookingStatusSchema } from '~/entities/booking/schema'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)

	const slug = requireRouteParam(event, 'slug')
	const bookingId = requireRouteParam(event, 'bookingId')

	const db = useDb()

	const body = await readValidatedBody(event, updateBookingStatusSchema.parse)
	const { status } = body

	if (!['ATTENDED', 'NO_SHOW', 'CONFIRMED'].includes(status)) {
		throw createError({ statusCode: 400, message: 'Invalid status' })
	}

	const access = await checkStudioAccess(userData.id, slug, [
		userRoles.BUSINESS,
		userRoles.MANAGER,
		userRoles.PRACTITIONER,
	])

	// We search for a reservation and extract the ID of the trainer assigned to this lesson.
	const [currentBooking] = await db
		.select({
			id: bookings.id,
			status: bookings.status,
			practitionerId: offeringSlots.practitionerId,
		})
		.from(bookings)
		.innerJoin(offeringSlots, eq(bookings.slotId, offeringSlots.id))
		.where(eq(bookings.id, bookingId))
		.limit(1)

	if (!currentBooking)
		throw createError({ statusCode: 404, message: 'Booking not found' })

	// Attendance cannot be marked if the user has cancelled the appointment.
	if (currentBooking.status === 'CANCELLED') {
		throw createError({
			statusCode: 400,
			message: 'Cannot change status of a cancelled booking',
		})
	}

	// If the COACH is editing, we check that this is his/her activity.
	if (
		access.roles.includes(userRoles.PRACTITIONER) &&
		currentBooking.practitionerId !== access.practitionerId
	) {
		throw createError({
			statusCode: 403,
			message: 'Forbidden: You can only update your own class bookings',
		})
	}

	// Updating the booking status
	await db
		.update(bookings)
		.set({
			status,
			updatedAt: new Date(),
		})
		.where(eq(bookings.id, bookingId))

	return { success: true, message: `Booking status updated to ${status}` }
})
