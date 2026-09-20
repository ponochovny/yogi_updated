import {
  cancelCheckout,
  cleanupExpiredCheckouts,
  fulfillCheckoutPayment,
  PENDING_CHECKOUT_TTL_MS
} from '../domain/checkout/checkout.service'

export { PENDING_CHECKOUT_TTL_MS, fulfillCheckoutPayment }

export function isPendingCheckoutStale(
  createdAt: Date | string | null | undefined,
  now = new Date(),
  ttlMs = PENDING_CHECKOUT_TTL_MS
) {
  if (!createdAt) return false
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt)
  return now.getTime() - created.getTime() >= ttlMs
}

export async function revertPendingCheckoutState(
  db: ReturnType<typeof useDb>,
  transactionId: string | null,
  _bookingId: string | null
) {
  if (transactionId) await cancelCheckout(db, transactionId)
}

export async function cleanupExpiredPendingCheckoutState(
  db: ReturnType<typeof useDb>,
  now = new Date(),
  _ttlMs = PENDING_CHECKOUT_TTL_MS
) {
  await cleanupExpiredCheckouts(db, now)
}
