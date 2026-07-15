/**
 * This file handles Stripe webhook events for the checkout process. It validates incoming requests, processes successful payments, and updates the database accordingly.
 *
 * The flow is as follows:
 * 1. Validate the incoming request body and signature to ensure it originates from Stripe.
 * 2. Parse the Stripe event and check for the 'checkout.session.completed' type.
 * 3. Extract and validate metadata from the Stripe session using a Zod schema.
 * 4. Start a database transaction to ensure atomicity.
 * 5. Fetch and lock the associated transaction record to prevent double processing.
 * 6. Update the transaction status to SUCCESS.
 * 7. Depending on whether it's a booking or pass purchase, update the booking status or issue credits to the user's wallet.
 * 8. Return a success response to Stripe to acknowledge receipt of the webhook event.
 *
 * Note: This endpoint should be secured and only accessible by Stripe's webhook system.
 */

import * as Sentry from '@sentry/nuxt'
import { bookings } from '~~/server/db/schema/booking'
import {
  transactions,
  TransactionStatus,
  userPasses,
  UserPassStatus
} from '~~/server/db/schema/payment'
import { pricingOptions } from '~~/server/db/schema/offering'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { BookingStatus } from '~/entities/booking/schema'
import { PaymentMetadataSchema } from '~/entities/payment/schema'
import {
  revertPendingCheckoutState,
  cleanupExpiredPendingCheckoutState
} from '~~/server/utils/checkout'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-06-24.dahlia'
})

type StripeError = { message: string }

export default defineEventHandler(async event => {
  const body = await readRawBody(event)
  const signature = getHeader(event, 'stripe-signature')

  if (!body || !signature) {
    throw createError({
      statusCode: 400,
      message: 'Webhook signature validation failed'
    })
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: unknown) {
    throw createError({
      statusCode: 400,
      message: `Webhook Error: ${(err as StripeError).message}`
    })
  }

  const db = useDb()

  if (stripeEvent.type === 'checkout.session.expired') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session
    const rawMetadata = session.metadata

    if (!rawMetadata || !rawMetadata.transactionId) {
      return { received: true }
    }

    const metadataResult = PaymentMetadataSchema.safeParse(rawMetadata)

    if (!metadataResult.success) {
      const sanitizedMetadata = {
        transactionId: rawMetadata.transactionId,
        pricingOptionId: rawMetadata.pricingOptionId,
        hasBookingId: Boolean(rawMetadata.bookingId)
      }

      Sentry.captureException(metadataResult.error, {
        extra: { sanitizedMetadata }
      })

      return { received: true, error: 'Metadata mismatch logged' }
    }

    const { transactionId, bookingId } = metadataResult.data
    await revertPendingCheckoutState(db, transactionId, bookingId)
    return { received: true }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session
    const rawMetadata = session.metadata

    if (!rawMetadata || !rawMetadata.transactionId) {
      throw createError({
        statusCode: 400,
        message: 'Invalid metadata inside Stripe session'
      })
    }

    // Metadata validation using Zod schema
    const metadataResult = PaymentMetadataSchema.safeParse(rawMetadata)

    if (!metadataResult.success) {
      // Build a safe, allowlisted payload before logging.
      const sanitizedMetadata = {
        transactionId: rawMetadata.transactionId,
        pricingOptionId: rawMetadata.pricingOptionId,
        hasBookingId: Boolean(rawMetadata.bookingId)
      }

      // Logging the error for debugging purposes
      Sentry.captureException(metadataResult.error, {
        extra: { sanitizedMetadata }
      })

      // Return 200 to the gateway to stop retries
      return { received: true, error: 'Metadata mismatch logged' }
    }

    const { transactionId, bookingId, pricingOptionId, userId } =
      metadataResult.data

    await cleanupExpiredPendingCheckoutState(db)

    // Execute everything safely within a database transaction
    await db.transaction(async tx => {
      // 1. Fetch and Lock transaction
      const [dbTx] = await tx
        .select()
        .from(transactions)
        .where(eq(transactions.id, transactionId))
        .for('update')

      // Guard: prevent processing double webhooks (idempotency)
      if (!dbTx || dbTx.status !== TransactionStatus.PENDING) return

      // 2. Mark Transaction as Paid
      await tx
        .update(transactions)
        .set({ status: TransactionStatus.SUCCESS, updatedAt: new Date() })
        .where(eq(transactions.id, transactionId))

      // CASE A: Direct Drop-in Slot Payment -> Confirm the booking
      if (bookingId) {
        await tx
          .update(bookings)
          .set({ status: BookingStatus.CONFIRMED, updatedAt: new Date() })
          .where(eq(bookings.id, bookingId))
      }

      // CASE B: Pass/Membership Payment -> Issue credits into user's wallet
      else {
        const [pricing] = await tx
          .select()
          .from(pricingOptions)
          .where(eq(pricingOptions.id, pricingOptionId))
          .limit(1)

        if (!pricing) throw new Error('Associated tariff not found')

        const durationDays = Number(pricing.durationDays)
        if (!Number.isFinite(durationDays) || durationDays < 0) {
          throw createError({
            statusCode: 400,
            message: 'Pricing option is missing a valid duration'
          })
        }

        const validFrom = new Date()
        const validUntil = new Date(validFrom)
        validUntil.setDate(validUntil.getDate() + durationDays)

        // Add the pass to the user wallet
        await tx.insert(userPasses).values({
          userId: userId,
          studioId: pricing.studioId,
          pricingOptionId: pricing.id,
          transactionId: transactionId,
          status: UserPassStatus.ACTIVE,
          remainingCredits: pricing.credits, // null for memberships, numeric for packs
          validFrom,
          validUntil,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    })
  }

  return { received: true }
})
