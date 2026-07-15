import { bookings } from '~~/server/db/schema/booking'
import {
  offeringSlots,
  offerings,
  pricingOptions
} from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import { eq, and, sql } from 'drizzle-orm'
import { BookingStatus, updateBookingSchema } from '~/entities/booking/schema'
import { transactions } from '~~/server/db/schema/payment'
import { getBookingTransactionState } from '~~/server/utils/booking-flow'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slotId = requireRouteParam(event, 'slotId')
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      slotId
    )
  ) {
    throwApiError(400, 'Invalid slot id')
  }
  const { pricingOptionId } = await readValidatedBody(
    event,
    updateBookingSchema.parse
  )

  if (!pricingOptionId) {
    throwApiError(400, 'Pricing option is required for booking')
  }

  const clientId = userData.id
  const db = useDb()

  try {
    // Small retry loop for transient serialization/deadlock errors
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // 2. Open a database transaction to prevent double-booking (Race Condition)
        return await db.transaction(async tx => {
          // Lock the slot row for update (if NeonDB supports it seamlessly, or just rely on quick sequential checks)
          // Fetch the slot and its parent offering to determine maximum capacity
          const [slotData] = await tx
            .select({
              slotId: offeringSlots.id,
              slotStatus: offeringSlots.status,
              slotOverrideCapacity: offeringSlots.capacityOverride,
              offeringCapacity: offerings.capacity,
              offeringId: offerings.id,
              studioId: offerings.studioId,
              currency: studios.currency
            })
            .from(offeringSlots)
            .innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
            .innerJoin(studios, eq(offerings.studioId, studios.id))
            .where(eq(offeringSlots.id, slotId))
            .limit(1)

          if (!slotData) {
            throwApiError(404, 'Slot not found')
          }

          if (slotData.slotStatus !== 'ACTIVE') {
            throwApiError(400, 'This session is not active for booking')
          }

          // Determine actual capacity
          const rawCapacity =
            slotData.slotOverrideCapacity ?? slotData.offeringCapacity
          const maxCapacity = rawCapacity === 0 ? null : rawCapacity

          // 3. Count existing active bookings for this specific slot
          const [bookingsCount] = await tx
            .select({ count: sql<number>`cast(count(${bookings.id}) as int)` })
            .from(bookings)
            .where(
              and(
                eq(bookings.slotId, slotId!),
                eq(bookings.status, BookingStatus.CONFIRMED)
              )
            )

          if (!bookingsCount) {
            throwApiError(500, 'Failed to retrieve booking count')
          }
          // 4. Capacity Check
          // If capacity is null/0, we assume unlimited. Otherwise, check limits.
          if (maxCapacity !== null && bookingsCount.count >= maxCapacity) {
            throwApiError(400, 'This session is fully booked')
          }

          // 5. Prevent double booking by the same user
          const [existingBooking] = await tx
            .select({ id: bookings.id })
            .from(bookings)
            .where(
              and(
                eq(bookings.slotId, slotId),
                eq(bookings.userId, clientId),
                eq(bookings.status, BookingStatus.CONFIRMED)
              )
            )
            .limit(1)

          if (existingBooking) {
            throwApiError(400, 'You have already booked this session')
          }

          // Fetch the pricing option to ensure it belongs to the same offering and studio

          const [pricing] = await tx
            .select()
            .from(pricingOptions)
            .where(
              and(
                eq(pricingOptions.id, pricingOptionId),
                eq(pricingOptions.offeringId, slotData.offeringId),
                eq(pricingOptions.studioId, slotData.studioId)
              )
            )
            .limit(1)

          if (!pricing) {
            throwApiError(400, 'Invalid pricing option for this slot')
          }

          const transactionState = getBookingTransactionState(pricing.price)

          const [newTransaction] = await tx
            .insert(transactions)
            .values({
              userId: clientId,
              studioId: pricing.studioId,
              amount: transactionState.transactionAmount,
              currency: slotData.currency,
              provider: transactionState.transactionProvider,
              status: transactionState.transactionStatus
            })
            .returning({ id: transactions.id })

          if (!newTransaction) {
            throwApiError(500, 'Failed to create transaction')
          }

          // 6. Create the booking
          const [newBooking] = await tx
            .insert(bookings)
            .values({
              slotId: slotId,
              userId: clientId,
              status: transactionState.bookingStatus,
              transactionId: newTransaction.id
            })
            .returning({ id: bookings.id })

          if (!newBooking) {
            throwApiError(500, 'Failed to create booking')
          }

          return {
            success: true,
            bookingId: newBooking.id
          }
        })
      } catch (e: unknown) {
        // Retry on serialization failure or deadlock
        const code =
          typeof e === 'object' && e !== null && 'code' in e
            ? String((e as { code?: unknown }).code ?? '')
            : ''
        const message =
          typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message?: unknown }).message ?? '')
            : ''
        if ((code === '40001' || code === '40P01') && attempt < maxAttempts) {
          // backoff a bit and retry
          await new Promise(r => setTimeout(r, 50 * attempt))
          continue
        }
        // Unique constraint: user already has a confirmed booking
        if (
          code === '23505' ||
          message.toLowerCase().includes('duplicate key')
        ) {
          throwApiError(400, 'You have already booked this session')
        }
        // Capacity enforcement from DB trigger
        if (message.toLowerCase().includes('capacity exceeded')) {
          throwApiError(400, 'This session is fully booked')
        }
        throw e
      }
    }
    // If we fall through, something unexpected happened
    throwApiError(500, 'Failed to book the session')
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to book the session', error)
    throwApiError(500, 'Failed to book the session')
  }
})
