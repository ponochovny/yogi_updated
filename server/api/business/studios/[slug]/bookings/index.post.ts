import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'
import { bookings } from '~~/server/db/schema/booking'
import {
  offeringSlots,
  offerings,
  pricingOptions
} from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import {
  transactions,
  TransactionProvider,
  TransactionStatus
} from '~~/server/db/schema/payment'
import { BookingStatus } from '~/entities/booking/schema'
import { userRoles } from '~~/server/auth/config'

const bookingSchema = z.object({ slotId: z.uuid(), userId: z.string().min(1) })

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const body = await readValidatedBody(event, bookingSchema.parse)
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS,
    userRoles.MANAGER
  ])
  const db = useDb()
  const [slot] = await db
    .select({ id: offeringSlots.id, studioId: offerings.studioId })
    .from(offeringSlots)
    .innerJoin(offerings, eq(offerings.id, offeringSlots.offeringId))
    .where(
      and(
        eq(offeringSlots.id, body.slotId),
        eq(offerings.studioId, access.studioId)
      )
    )
    .limit(1)
  if (!slot) throwApiError(404, 'Slot not found')
  const [existing] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.slotId, body.slotId),
        eq(bookings.userId, body.userId),
        ne(bookings.status, BookingStatus.CANCELLED)
      )
    )
    .limit(1)
  if (existing) throwApiError(409, 'This client is already booked for the slot')
  const [price] = await db
    .select({ amount: pricingOptions.price, currency: studios.currency })
    .from(studios)
    .innerJoin(pricingOptions, eq(pricingOptions.studioId, studios.id))
    .where(
      and(
        eq(studios.id, access.studioId),
        eq(pricingOptions.type, 'DROP_IN'),
        eq(pricingOptions.isActive, true)
      )
    )
    .limit(1)
  const [transaction] = await db
    .insert(transactions)
    .values({
      userId: body.userId,
      studioId: access.studioId,
      amount: price?.amount ?? 0,
      currency: price?.currency ?? 'USD',
      provider: TransactionProvider.CASH,
      status: TransactionStatus.PENDING
    })
    .returning({ id: transactions.id })

  if (!transaction) throwApiError(500, 'Failed to create transaction')

  const [created] = await db
    .insert(bookings)
    .values({
      slotId: body.slotId,
      userId: body.userId,
      transactionId: transaction?.id,
      status: BookingStatus.PENDING
    })
    .returning()
  return { success: true, booking: created }
})
