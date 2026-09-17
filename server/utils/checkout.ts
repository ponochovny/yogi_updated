import { bookings } from '../db/schema/booking'
import {
  transactions,
  TransactionProvider,
  TransactionStatus,
  userPasses,
  UserPassStatus
} from '../db/schema/payment'
import { pricingOptions } from '../db/schema/offering'
import { and, eq, lt } from 'drizzle-orm'
import { BookingStatus } from '../../app/entities/booking/schema'
import { calculatePricingValidUntil } from './pricing-expiry'

export const PENDING_CHECKOUT_TTL_MS = 15 * 60 * 1000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CheckoutDbLike = any

export const fulfillCheckoutPayment = async (
  db: CheckoutDbLike,
  transactionId: string,
  pricingOptionId?: string | null
) => {
  return db.transaction(async tx => {
    const [lockedTransaction] = await tx
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .for('update')

    if (
      !lockedTransaction ||
      lockedTransaction.status !== TransactionStatus.PENDING
    ) {
      return false
    }

    const [booking] = await tx
      .select()
      .from(bookings)
      .where(eq(bookings.transactionId, transactionId))
      .limit(1)

    if (booking) {
      if (booking.status === BookingStatus.PENDING) {
        await tx
          .update(bookings)
          .set({ status: BookingStatus.CONFIRMED, updatedAt: new Date() })
          .where(eq(bookings.id, booking.id))
      }
    } else {
      const [existingPass] = await tx
        .select()
        .from(userPasses)
        .where(eq(userPasses.transactionId, transactionId))
        .limit(1)

      if (!existingPass) {
        if (!pricingOptionId) {
          throw new Error('Pass purchase is missing a pricing option')
        }

        const [pricing] = await tx
          .select()
          .from(pricingOptions)
          .where(eq(pricingOptions.id, pricingOptionId))
          .limit(1)

        if (!pricing) {
          throw new Error('Associated pricing option not found')
        }

        const durationDays = Number(pricing.durationDays) || 30
        const validFrom = new Date()
        const validUntil = calculatePricingValidUntil(validFrom, {
          durationDays,
          expiryRule: pricing.expiryRule,
          expiryBufferDays: pricing.expiryBufferDays
        })

        await tx.insert(userPasses).values({
          userId: lockedTransaction.userId,
          studioId: pricing.studioId,
          pricingOptionId: pricing.id,
          transactionId,
          status: UserPassStatus.ACTIVE,
          remainingCredits: pricing.credits,
          validFrom,
          validUntil,
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

export const isPendingCheckoutStale = (
  createdAt: Date | string | null | undefined,
  now = new Date(),
  ttlMs = PENDING_CHECKOUT_TTL_MS
) => {
  if (!createdAt) {
    return false
  }

  const created = createdAt instanceof Date ? createdAt : new Date(createdAt)
  return now.getTime() - created.getTime() >= ttlMs
}

export const revertPendingCheckoutState = async (
  db: CheckoutDbLike,
  transactionId: string | null,
  bookingId: string | null
) => {
  if (!transactionId) {
    return
  }

  const applyRevert = async (target: CheckoutDbLike) => {
    await target
      .update(transactions)
      .set({
        status: TransactionStatus.FAILED,
        providerTransactionId: null,
        failureReason:
          'Checkout expired or was abandoned before payment completed.',
        updatedAt: new Date()
      })
      .where(eq(transactions.id, transactionId))

    if (bookingId) {
      await target
        .update(bookings)
        .set({
          status: BookingStatus.CANCELLED,
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId))
    }
  }

  if (typeof db.transaction === 'function') {
    // @ts-expect-error: tx is a transaction object, which may not have the same type as the main db object. We assume it has the same methods for our use case.
    await db.transaction(async tx => {
      await applyRevert(tx as CheckoutDbLike)
    })
    return
  }

  await applyRevert(db)
}

export const cleanupExpiredPendingCheckoutState = async (
  db: CheckoutDbLike,
  now = new Date(),
  ttlMs = PENDING_CHECKOUT_TTL_MS
) => {
  const cutoff = new Date(now.getTime() - ttlMs)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staleTransactions = (await (db as any)
    .select({
      id: transactions.id,
      bookingId: bookings.id
    })
    .from(transactions)
    .leftJoin(bookings, eq(transactions.id, bookings.transactionId))
    .where(
      and(
        eq(transactions.status, TransactionStatus.PENDING),
        eq(transactions.provider, TransactionProvider.STRIPE),
        lt(transactions.createdAt, cutoff)
      )
    )) as Array<{ id: string; bookingId: string | null }>

  for (const staleTransaction of staleTransactions) {
    await revertPendingCheckoutState(
      db,
      staleTransaction.id,
      staleTransaction.bookingId
    )
  }
}
