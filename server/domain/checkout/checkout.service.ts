import Stripe from 'stripe'
import { and, eq, lt } from 'drizzle-orm'
import { createBooking } from '../booking/booking.service'
import { calculatePricingValidUntil } from '../../utils/pricing-expiry'
import { pricingOptions } from '../../db/schema/offering'
import { bookings } from '../../db/schema/booking'
import { studios } from '../../db/schema/studio'
import {
  TransactionProvider,
  transactions,
  TransactionStatus,
  userPasses,
  UserPassStatus
} from '../../db/schema/payment'
import { globalCurrencies } from '../../db/schema/global'
import { PaymentMetadataSchema } from '../../../app/entities/payment/schema'

export const PENDING_CHECKOUT_TTL_MS = 15 * 60 * 1000
type Database = ReturnType<typeof useDb>

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-06-24.dahlia'
  })
}

export interface CreateCheckoutInput {
  userId: string
  email?: string | null
  pricingOptionId: string
  slotId?: string
  idempotencyKey: string
}

export async function createCheckoutSession(
  db: Database,
  input: CreateCheckoutInput
) {
  const existing = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, input.userId),
        eq(transactions.idempotencyKey, input.idempotencyKey)
      )
    )
    .limit(1)
  if (existing[0]?.providerTransactionId) {
    const session = await getStripe().checkout.sessions.retrieve(
      existing[0].providerTransactionId
    )
    return { success: true, url: session.url, transactionId: existing[0].id }
  }

  const reservation = input.slotId
    ? await createBooking(db, {
        userId: input.userId,
        slotId: input.slotId,
        pricingOptionId: input.pricingOptionId,
        mode: 'STRIPE',
        idempotencyKey: input.idempotencyKey
      })
    : await db.transaction(async tx => {
        const [pricing] = await tx
          .select({
            id: pricingOptions.id,
            studioId: pricingOptions.studioId,
            name: pricingOptions.name,
            description: pricingOptions.description,
            price: pricingOptions.price,
            isActive: pricingOptions.isActive,
            currency: studios.currency
          })
          .from(pricingOptions)
          .innerJoin(studios, eq(pricingOptions.studioId, studios.id))
          .where(eq(pricingOptions.id, input.pricingOptionId))
          .limit(1)
        if (!pricing || !pricing.isActive)
          throw createError({
            statusCode: 404,
            message: 'Pricing option not found or inactive'
          })
        const [currency] = await tx
          .select()
          .from(globalCurrencies)
          .where(eq(globalCurrencies.name, pricing.currency))
          .limit(1)
        if (!currency)
          throw createError({
            statusCode: 404,
            message: 'Currency not found for the selected pricing option'
          })
        const [transaction] = await tx
          .insert(transactions)
          .values({
            userId: input.userId,
            studioId: pricing.studioId,
            amount: pricing.price,
            currency: currency.name.toUpperCase(),
            provider: TransactionProvider.STRIPE,
            status: TransactionStatus.PENDING,
            idempotencyKey: input.idempotencyKey
          })
          .returning()
        if (!transaction)
          throw createError({
            statusCode: 500,
            message: 'Failed to create transaction'
          })
        return { transaction, pricing }
      })

  const transaction = reservation.transaction
  const pricing = reservation.pricing
  if (!transaction || !pricing)
    throw createError({
      statusCode: 500,
      message: 'Checkout reservation is incomplete'
    })

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: transaction.currency.toLowerCase(),
              product_data: {
                name: pricing.name,
                description: pricing.description || undefined
              },
              unit_amount: pricing.price
            },
            quantity: 1
          }
        ],
        success_url: `${process.env.VITE_BASE_URL || 'http://localhost:3000'}/checkout/success?transactionId=${transaction.id}`,
        cancel_url: `${process.env.VITE_BASE_URL || 'http://localhost:3000'}/checkout/cancel?transactionId=${transaction.id}`,
        customer_email: input.email || undefined,
        metadata: {
          transactionId: transaction.id,
          pricingOptionId: input.pricingOptionId,
          userId: input.userId,
          ...('booking' in reservation &&
            reservation.booking && { bookingId: reservation.booking.id })
        }
      },
      { idempotencyKey: input.idempotencyKey }
    )
    await db
      .update(transactions)
      .set({ providerTransactionId: session.id, updatedAt: new Date() })
      .where(eq(transactions.id, transaction.id))
    return { success: true, url: session.url, transactionId: transaction.id }
  } catch (error) {
    await cancelCheckout(db, transaction.id)
    throw error
  }
}

export async function fulfillCheckoutPayment(
  db: Database,
  transactionId: string,
  pricingOptionId?: string | null
) {
  return db.transaction(async tx => {
    const [transaction] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .for('update')
    if (!transaction || transaction.status !== TransactionStatus.PENDING)
      return false
    const [booking] = await tx
      .select()
      .from(bookings)
      .where(eq(bookings.transactionId, transactionId))
      .limit(1)
    if (booking) {
      if (booking.status === 'PENDING') {
        await tx
          .update(bookings)
          .set({ status: 'CONFIRMED', updatedAt: new Date() })
          .where(eq(bookings.id, booking.id))
      }
    } else {
      const [pass] = await tx
        .select()
        .from(userPasses)
        .where(eq(userPasses.transactionId, transactionId))
        .limit(1)
      if (!pass) {
        if (!pricingOptionId)
          throw new Error('Pass purchase is missing a pricing option')
        const [pricing] = await tx
          .select()
          .from(pricingOptions)
          .where(eq(pricingOptions.id, pricingOptionId))
          .limit(1)
        if (!pricing) throw new Error('Associated pricing option not found')
        const validFrom = new Date()
        await tx.insert(userPasses).values({
          userId: transaction.userId,
          studioId: pricing.studioId,
          pricingOptionId: pricing.id,
          transactionId,
          status: UserPassStatus.ACTIVE,
          remainingCredits: pricing.credits,
          validFrom,
          validUntil: calculatePricingValidUntil(validFrom, {
            durationDays: Number(pricing.durationDays),
            expiryRule: pricing.expiryRule,
            expiryBufferDays: pricing.expiryBufferDays
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }
    await tx
      .update(transactions)
      .set({ status: TransactionStatus.SUCCESS, updatedAt: new Date() })
      .where(eq(transactions.id, transactionId))
    return true
  })
}

export async function cancelCheckout(db: Database, transactionId: string) {
  const cancelled = await db.transaction(async tx => {
    await tx
      .update(transactions)
      .set({ status: TransactionStatus.CANCELLED, updatedAt: new Date() })
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.status, TransactionStatus.PENDING)
        )
      )
    await tx
      .update(bookings)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(
        and(
          eq(bookings.transactionId, transactionId),
          eq(bookings.status, 'PENDING')
        )
      )
    return true
  })
  if (cancelled && process.env.STRIPE_SECRET_KEY) {
    const [transaction] = await db
      .select({ providerTransactionId: transactions.providerTransactionId })
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1)
    if (transaction?.providerTransactionId) {
      try {
        await getStripe().checkout.sessions.expire(
          transaction.providerTransactionId
        )
      } catch {
        // The session may already be complete or expired; the database state is authoritative.
      }
    }
  }
  return cancelled
}

export async function cancelCheckoutForUser(
  db: Database,
  transactionId: string,
  userId: string
) {
  const [transaction] = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
    )
    .limit(1)
  if (!transaction)
    throw createError({
      statusCode: 404,
      message: 'Transaction not found or unauthorized'
    })
  return cancelCheckout(db, transaction.id)
}

export async function cleanupExpiredCheckouts(db: Database, now = new Date()) {
  const cutoff = new Date(now.getTime() - PENDING_CHECKOUT_TTL_MS)
  const stale = await db
    .select({ id: transactions.id, bookingId: bookings.id })
    .from(transactions)
    .leftJoin(bookings, eq(transactions.id, bookings.transactionId))
    .where(
      and(
        eq(transactions.status, TransactionStatus.PENDING),
        eq(transactions.provider, TransactionProvider.STRIPE),
        lt(transactions.createdAt, cutoff)
      )
    )
  for (const transaction of stale) await cancelCheckout(db, transaction.id)
}

export function parseCheckoutMetadata(metadata: Stripe.Metadata | null) {
  return PaymentMetadataSchema.parse(metadata)
}

export async function handleStripeWebhook(db: Database, event: Stripe.Event) {
  if (
    event.type === 'checkout.session.async_payment_failed' ||
    event.type === 'payment_intent.payment_failed'
  ) {
    const payment = event.data.object as
      | Stripe.Checkout.Session
      | Stripe.PaymentIntent
    const transactionId = payment.metadata?.transactionId
    if (!transactionId) return
    await db
      .update(transactions)
      .set({
        status: TransactionStatus.FAILED,
        failureReason: 'The payment provider reported that the payment failed.',
        providerTransactionId: payment.id,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.status, TransactionStatus.PENDING)
        )
      )
    return
  }

  if (event.type === 'checkout.session.expired') {
    const metadata = (event.data.object as Stripe.Checkout.Session).metadata
    if (metadata?.transactionId)
      await cancelCheckout(db, metadata.transactionId)
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = PaymentMetadataSchema.safeParse(session.metadata)
    if (!metadata.success)
      throw new Error('Invalid metadata inside Stripe session')
    await fulfillCheckoutPayment(
      db,
      metadata.data.transactionId,
      metadata.data.pricingOptionId
    )
  }
}
