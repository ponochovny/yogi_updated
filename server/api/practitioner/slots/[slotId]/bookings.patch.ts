import { and, eq, inArray, lte } from 'drizzle-orm'
import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots } from '~~/server/db/schema/offering'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { z } from 'zod'

const schema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(['ATTENDED', 'NO_SHOW'])
})

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const db = useDb()
  const slotId = requireRouteParam(event, 'slotId')

  const body = await readValidatedBody(event, schema.parse)
  const { bookingId, status } = body

  const [slot] = await db
    .select({ practitionerId: offeringSlots.practitionerId })
    .from(offeringSlots)
    .innerJoin(
      studioPractitioners,
      eq(offeringSlots.practitionerId, studioPractitioners.id)
    )
    .where(
      and(
        eq(offeringSlots.id, slotId),
        eq(studioPractitioners.userId, userData.id),
        lte(offeringSlots.startTime, new Date())
      )
    )
    .limit(1)

  if (!slot) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: You can only update your own class bookings'
    })
  }

  const [booking] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      slotId: bookings.slotId
    })
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.slotId, slotId)))
    .limit(1)

  if (!booking) {
    throw createError({ statusCode: 404, message: 'Booking not found' })
  }

  if (booking.status === 'CANCELLED') {
    throw createError({
      statusCode: 400,
      message: 'Cannot change the status of a cancelled booking'
    })
  }

  const [updatedBooking] = await db
    .update(bookings)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(bookings.id, bookingId),
        eq(bookings.slotId, slotId),
        inArray(bookings.status, ['ACTIVE', 'CONFIRMED', 'ATTENDED', 'NO_SHOW'])
      )
    )
    .returning({ id: bookings.id })

  if (!updatedBooking) {
    throw createError({
      statusCode: 400,
      message: 'Cannot change the status of this booking'
    })
  }

  return { success: true, status }
})
