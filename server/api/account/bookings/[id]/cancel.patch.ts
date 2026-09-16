import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots } from '~~/server/db/schema/offering'
import { userPasses } from '~~/server/db/schema/payment'
import { eq, and, ne, sql } from 'drizzle-orm'
import { BookingStatus } from '~/entities/booking/schema'

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  const bookingId = requireRouteParam(event, 'id')
  const db = useDb()
  const userId = user.id

  const [booking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      slotStartTime: offeringSlots.startTime,
      userPassId: bookings.userPassId
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

  const cancellationDeadline =
    new Date(booking.slotStartTime).getTime() - 60 * 60 * 1000
  if (Date.now() > cancellationDeadline) {
    throwApiError(
      400,
      'Bookings can only be cancelled at least 1 hour before class'
    )
  }

  try {
    await db.transaction(async tx => {
      const [cancelledBooking] = await tx
        .update(bookings)
        .set({ status: BookingStatus.CANCELLED, updatedAt: new Date() })
        .where(
          and(
            eq(bookings.id, bookingId),
            ne(bookings.status, BookingStatus.CANCELLED)
          )
        )
        .returning({ id: bookings.id })

      if (!cancelledBooking) {
        throwApiError(400, 'Already cancelled')
      }

      if (booking.userPassId) {
        await tx
          .update(userPasses)
          .set({
            remainingCredits: sql`case when ${userPasses.remainingCredits} is null then null else ${userPasses.remainingCredits} + 1 end`,
            status: 'ACTIVE',
            updatedAt: new Date()
          })
          .where(eq(userPasses.id, booking.userPassId))
      }
    })

    return { success: true, message: 'Booking cancelled successfully' }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to cancel the booking', error)
    throwApiError(500, 'Failed to cancel booking')
  }
})
