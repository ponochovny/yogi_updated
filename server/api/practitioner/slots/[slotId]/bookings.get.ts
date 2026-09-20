import { and, eq } from 'drizzle-orm'
import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots } from '~~/server/db/schema/offering'
import { transactions } from '~~/server/db/schema/payment'
import { user } from '~~/server/db/schema/auth-schema'
import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const db = useDb()
  const slotId = requireRouteParam(event, 'slotId')

  const [slot] = await db
    .select({
      id: offeringSlots.id,
      practitionerId: offeringSlots.practitionerId,
      studioId: studios.id,
      studioName: studios.name,
      startTime: offeringSlots.startTime,
      endTime: offeringSlots.endTime
    })
    .from(offeringSlots)
    .innerJoin(
      studioPractitioners,
      eq(offeringSlots.practitionerId, studioPractitioners.id)
    )
    .innerJoin(studios, eq(studioPractitioners.studioId, studios.id))
    .where(
      and(
        eq(offeringSlots.id, slotId),
        eq(studioPractitioners.userId, userData.id)
      )
    )
    .limit(1)

  if (!slot) {
    throw createError({ statusCode: 404, message: 'Slot not found' })
  }

  const bookingsList = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      createdAt: bookings.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image
      },
      transaction: {
        provider: transactions.provider,
        status: transactions.status
      }
    })
    .from(bookings)
    .innerJoin(user, eq(bookings.userId, user.id))
    .leftJoin(transactions, eq(bookings.transactionId, transactions.id))
    .where(eq(bookings.slotId, slotId))
    .orderBy(bookings.createdAt)

  return {
    slot,
    bookings: bookingsList,
    canManageAttendance: userData.roles.includes(userRoles.PRACTITIONER)
  }
})
