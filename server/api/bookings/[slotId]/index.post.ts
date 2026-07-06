import { bookings } from '~~/server/db/schema/booking'
import {
  offeringSlots,
  offerings,
  pricingOptions
} from '~~/server/db/schema/offering'
import {
  TransactionProvider,
  transactions,
  userPasses
} from '~~/server/db/schema/payment'
import { eq, and, sql } from 'drizzle-orm'
import { createBookingSchema } from '~/entities/booking/schema'
import { priceOptionsType } from '~/entities/membership/schema'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slotId = requireRouteParam(event, 'slotId')
  const body = await readValidatedBody(event, createBookingSchema.parse)
  const db = useDb()

  const { pricingOptionId, userPassId } = body

  type BookingResult = {
    booking: typeof bookings.$inferSelect
    transaction?: typeof transactions.$inferSelect
    type: typeof priceOptionsType.MEMBERSHIP | typeof TransactionProvider.CASH
  }

  let result: BookingResult | null = null

  // Start SQL Transaction to prevent concurrent bookings exceeding capacity or double spending passes
  await db.transaction(async tx => {
    // 1. Lock the slot row for update to prevent concurrent booking check race conditions
    const [slot] = await tx
      .select({
        id: offeringSlots.id,
        capacityOverride: offeringSlots.capacityOverride,
        startTime: offeringSlots.startTime,
        status: offeringSlots.status,
        offeringId: offeringSlots.offeringId
      })
      .from(offeringSlots)
      .where(eq(offeringSlots.id, slotId))
      .for('update')

    if (!slot) {
      throw createError({ statusCode: 404, message: 'Time slot not found' })
    }

    if (slot.status === 'CANCELLED') {
      throw createError({
        statusCode: 400,
        message: 'This class has been cancelled'
      })
    }

    // 2. Fetch default capacity from parent offering
    const [offering] = await tx
      .select({
        id: offerings.id,
        capacity: offerings.capacity,
        studioId: offerings.studioId,
        currency: offerings.timezone // or pull currency from studio if needed, using default currency
      })
      .from(offerings)
      .where(eq(offerings.id, slot.offeringId))

    const maxCapacity = slot.capacityOverride ?? offering?.capacity ?? 999999

    // 3. Count currently confirmed/attended/no-show bookings for this slot
    const [activeBookingsCount] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.slotId, slotId),
          sql`${bookings.status} IN (BookingStatus.CONFIRMED, BookingStatus.ATTENDED, BookingStatus.NO_SHOW)`
        )
      )

    const currentBookedCount = Number(activeBookingsCount?.count || 0)
    if (currentBookedCount >= maxCapacity) {
      throw createError({
        statusCode: 400,
        message: 'This class is already fully booked'
      })
    }

    // 4. Scenario A: Booking using an existing User Pass (Membership/Pack credit)
    if (userPassId) {
      // Lock the user pass row to prevent double spending
      const [pass] = await tx
        .select()
        .from(userPasses)
        .where(
          and(eq(userPasses.id, userPassId), eq(userPasses.userId, userData.id))
        )
        .for('update')

      if (
        !pass ||
        pass.status !== 'ACTIVE' ||
        (pass.validUntil && new Date(pass.validUntil) < new Date())
      ) {
        throw createError({
          statusCode: 400,
          message: 'Your pass is invalid or expired'
        })
      }

      // If pass has limited credits, decrement them
      if (pass.remainingCredits !== null) {
        if (pass.remainingCredits <= 0) {
          throw createError({
            statusCode: 400,
            message: 'Your pass has no remaining credits'
          })
        }

        const newCredits = pass.remainingCredits - 1
        const passStatus = newCredits === 0 ? 'EXHAUSTED' : 'ACTIVE'

        await tx
          .update(userPasses)
          .set({
            remainingCredits: newCredits,
            status: passStatus,
            updatedAt: new Date()
          })
          .where(eq(userPasses.id, pass.id))
      }

      // Create booking linked to the user pass
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          slotId: slot.id,
          userId: userData.id,
          status: 'CONFIRMED',
          userPassId: pass.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
      if (!newBooking) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create booking with membership pass'
        })
      }

      result = { booking: newBooking, type: priceOptionsType.MEMBERSHIP }
    } else if (pricingOptionId) {
      // 5. Scenario B: Booking using a Drop-In ticket (Cash on site)
      const [pricing] = await tx
        .select()
        .from(pricingOptions)
        .where(eq(pricingOptions.id, pricingOptionId))
        .limit(1)

      if (
        !pricing ||
        pricing.type !== priceOptionsType.DROP_IN ||
        !pricing.isActive
      ) {
        throw createError({
          statusCode: 400,
          message: 'Invalid ticket option selected'
        })
      }

      // Create a PENDING cash transaction in our unified ledger
      const [newTransaction] = await tx
        .insert(transactions)
        .values({
          userId: userData.id,
          studioId: offering?.studioId as string,
          amount: pricing.price, // Prices are stored in cents/kopecks
          currency: 'USD', // Ideally fetched dynamically, fallback to USD
          provider: TransactionProvider.CASH, // Payment to be made on location
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
      if (!newTransaction) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create transaction for cash booking'
        })
      }

      // Create booking linked to the pending transaction
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          slotId: slot.id,
          userId: userData.id,
          status: 'CONFIRMED', // Slot is secured for client, awaiting cash validation
          transactionId: newTransaction.id,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
      if (!newBooking) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create booking with cash transaction'
        })
      }

      result = {
        booking: newBooking,
        transaction: newTransaction,
        type: TransactionProvider.CASH
      }
    }
  })

  return {
    success: true,
    message:
      result !== null &&
      (result as BookingResult).type === priceOptionsType.MEMBERSHIP
        ? 'Booked successfully using your membership pass!'
        : 'Booked successfully! Please pay cash at the studio reception.',
    data: result
  }
})
