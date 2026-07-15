import { bookings } from '../db/schema/booking'
import {
  transactions,
  TransactionProvider,
  TransactionStatus
} from '../db/schema/payment'
import { and, eq, lt } from 'drizzle-orm'
import { BookingStatus } from '../../app/entities/booking/schema'

export const PENDING_CHECKOUT_TTL_MS = 15 * 60 * 1000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CheckoutDbLike = any

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
