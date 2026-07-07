/**
 * Booking or user pass (membership or class pack) purchase
 * This endpoint handles the creation of a Stripe Checkout session for either:
 * 1. Booking a specific class slot (Drop-In)
 * 2. Purchasing a user pass (Membership or Class Pack)
 *
 * The flow is as follows:
 * 1. Validate the request body to ensure a valid pricing option and optional slot ID.
 * 2. Start a database transaction to ensure atomicity.
 * 3. Fetch the pricing option and validate its existence and active status.
 * 4. If a slot ID is provided, validate the slot's availability and capacity.
 * 5. Create a PENDING transaction record in the database.
 * 6. If booking a slot, create a PENDING booking record to hold the seat during checkout.
 * 7. Generate a Stripe Checkout session with the appropriate line items and metadata.
 * 8. Update the transaction record with the Stripe session ID.
 * 9. Return the Stripe Checkout URL to the client for redirection.
 *
 * Note: The actual confirmation of bookings or pass purchases will be handled via Stripe webhooks,
 * which will update the transaction and booking statuses accordingly upon successful payment.
 */

import {
  offeringSlots,
  offerings,
  pricingOptions
} from '~~/server/db/schema/offering'
import { bookings } from '~~/server/db/schema/booking'
import {
  TransactionProvider,
  transactions,
  TransactionStatus
} from '~~/server/db/schema/payment'
import { studios } from '~~/server/db/schema/studio'
import { createSessionSchema } from '~/entities/payment/schema'
import { eq, and, sql } from 'drizzle-orm'
import Stripe from 'stripe'
import { BookingStatus } from '~/entities/booking/schema'
import { offeringSlotStatus, pricingType } from '~/entities/offering/schema'

// Initialize Stripe with the private key (normally fetched from runtime config)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-06-24.dahlia' // or latest stable version
})

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  /** If slotId is provided, it's a Drop-In. Otherwise, it's a Pass purchase. */
  const body = await readValidatedBody(event, createSessionSchema.parse)
  const db = useDb()
  const { pricingOptionId, slotId } = body

  let checkoutUrl: string | null = null

  const { pricing, transactionId, bookingId, lineItemName, checkoutCurrency } =
    await db.transaction(async tx => {
      /** Fetch pricing option details
       * 		To check if it's still exists and active.
       * Then, check
       * 		CASE A: if slotId is provided, then it's a booking purchase.
       * 		CASE B: If slotId is not provided, it's a pass purchase and NOT a booking.
       * Proceed to create a transaction and booking (if slotId is provided).
       */
      const [pricing] = await tx
        .select({
          id: pricingOptions.id,
          studioId: pricingOptions.studioId,
          name: pricingOptions.name,
          description: pricingOptions.description,
          price: pricingOptions.price,
          type: pricingOptions.type,
          isActive: pricingOptions.isActive,
          currency: studios.currency
        })
        .from(pricingOptions)
        .innerJoin(studios, eq(pricingOptions.studioId, studios.id))
        .where(eq(pricingOptions.id, pricingOptionId))
        .limit(1)
      if (!pricing || !pricing.isActive) {
        throwApiError(404, 'Pricing option not found or inactive')
      }

      let bookingId: string | null = null
      /** Inside our DB, table "transactions" */
      let transactionId: string | null = null
      let lineItemName = pricing.name
      const checkoutCurrency = (pricing.currency || 'USD').toUpperCase()

      // CASE A: DIRECT SLOT BOOKING (DROP-IN ONLINE PAYMENT)
      if (slotId) {
        // Prevent users from booking a slot with a pricing option that is not a drop-in type
        if (pricing.type !== pricingType.DROP_IN) {
          throwApiError(
            400,
            'Selected ticket type is not applicable for direct bookings'
          )
        }

        // Lock the slot row to prevent concurrent race conditions
        const [slot] = await tx
          .select({
            id: offeringSlots.id,
            capacityOverride: offeringSlots.capacityOverride,
            status: offeringSlots.status,
            offeringId: offeringSlots.offeringId
          })
          .from(offeringSlots)
          .where(eq(offeringSlots.id, slotId))
          .for('update')
        if (!slot || slot.status === offeringSlotStatus.CANCELLED) {
          throwApiError(
            404,
            'Selected class slot not found or has been cancelled'
          )
        }

        // Fetch capacity from offering
        const [offering] = await tx
          .select({ capacity: offerings.capacity, name: offerings.name })
          .from(offerings)
          .where(eq(offerings.id, slot.offeringId))
          .limit(1)
        if (!offering) {
          throwApiError(404, 'Offering not found for the selected slot')
        }

        lineItemName = `${offering.name} - Slot Booking`

        // Verify slot is not overbooked
        const maxCapacity = slot.capacityOverride ?? offering?.capacity ?? 9999
        const [activeBookings] = await tx
          .select({ count: sql<number>`count(*)` })
          .from(bookings)
          .where(
            and(
              eq(bookings.slotId, slotId),
              sql`${bookings.status} IN (${BookingStatus.CONFIRMED}, ${BookingStatus.ATTENDED}, ${BookingStatus.NO_SHOW}, ${BookingStatus.PENDING})`
            )
          )
        if (Number(activeBookings?.count || 0) >= maxCapacity) {
          throwApiError(400, 'Sorry, this class is already fully booked')
        }

        // Create a PENDING transaction
        const [newTx] = await tx
          .insert(transactions)
          .values({
            userId: userData.id,
            studioId: pricing.studioId,
            amount: pricing.price, // Value in cents
            currency: checkoutCurrency,
            provider: TransactionProvider.STRIPE,
            status: TransactionStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()
        if (!newTx) {
          throwApiError(500, 'Failed to create transaction for booking')
        }

        transactionId = newTx.id

        // Create a PENDING booking to hold the seat during checkout
        // We set status to PENDING so it doesn't count as a guaranteed seat yet (or CONFIRMED if your rules lock seats on click)
        const [newBooking] = await tx
          .insert(bookings)
          .values({
            slotId: slot.id,
            userId: userData.id,
            status: BookingStatus.PENDING, // Will be confirmed by webhook
            transactionId: newTx.id,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()
        if (!newBooking) {
          throwApiError(500, 'Failed to create booking for slot')
        }

        bookingId = newBooking.id
      }

      // CASE B: MEMBERSHIP OR CLASS PACK PURCHASE (NO SLOT LINKED)
      else {
        // Create a PENDING transaction for the pass purchase
        const [newTx] = await tx
          .insert(transactions)
          .values({
            userId: userData.id,
            studioId: pricing.studioId,
            amount: pricing.price,
            currency: checkoutCurrency,
            provider: TransactionProvider.STRIPE,
            status: TransactionStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning()
        if (!newTx) {
          throwApiError(500, 'Failed to create transaction for pass purchase')
        }

        transactionId = newTx.id
      }

      return {
        pricing,
        transactionId,
        bookingId,
        lineItemName,
        checkoutCurrency
      }
    })

  const stripeCurrency = checkoutCurrency.toLowerCase()

  // 4. Generate Stripe Checkout Session
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: stripeCurrency,
          product_data: {
            name: lineItemName,
            description: pricing.description || undefined
          },
          unit_amount: pricing.price // Stored in cents (e.g. 1500 = $15.00)
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/success?transactionId=${transactionId}`,
    cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/cancel?transactionId=${transactionId}`,
    // Crucial: metadata carries database references to identify the invoice on webhook reception
    metadata: {
      transactionId: transactionId,
      bookingId: bookingId, // null if purchasing a membership
      pricingOptionId: pricing.id,
      userId: userData.id
    }
  })

  // 5. Update transaction with Stripe external ID
  await db
    .update(transactions)
    .set({ providerTransactionId: stripeSession.id })
    .where(eq(transactions.id, transactionId || ''))

  checkoutUrl = stripeSession.url

  return {
    success: true,
    url: checkoutUrl
  }
})
