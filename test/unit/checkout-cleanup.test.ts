import { describe, expect, it } from 'vitest'
import { BookingStatus } from '../../app/entities/booking/schema'
import {
  cleanupExpiredPendingCheckoutState,
  isPendingCheckoutStale,
  PENDING_CHECKOUT_TTL_MS
} from '../../server/utils/checkout'
import { TransactionStatus } from '../../server/db/schema/payment'

describe('checkout pending cleanup helpers', () => {
  it('detects stale pending checkout transactions', () => {
    const now = new Date()
    const staleCreatedAt = new Date(
      now.getTime() - PENDING_CHECKOUT_TTL_MS - 1000
    )

    expect(isPendingCheckoutStale(staleCreatedAt, now)).toBe(true)
    expect(isPendingCheckoutStale(now, now)).toBe(false)
  })

  it('reverts stale pending Stripe transactions and associated bookings', async () => {
    const updates: Array<{ table: string; values: Record<string, unknown> }> =
      []

    const fakeDb = {
      transaction: async (callback: (tx: unknown) => Promise<unknown>) =>
        callback(fakeDb),
      update(table: unknown) {
        return {
          set(values: Record<string, unknown>) {
            return {
              where: async () => {
                updates.push({ table: String(table), values })
                return { rowCount: 1 }
              }
            }
          }
        }
      },
      select() {
        return {
          from() {
            return {
              leftJoin() {
                return {
                  where: async () => [{ id: 'txn-1', bookingId: 'booking-1' }]
                }
              }
            }
          }
        }
      }
    }

    await cleanupExpiredPendingCheckoutState(
      fakeDb as never,
      new Date(),
      PENDING_CHECKOUT_TTL_MS
    )

    expect(updates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          values: expect.objectContaining({
            status: TransactionStatus.FAILED,
            providerTransactionId: null
          })
        }),
        expect.objectContaining({
          values: expect.objectContaining({ status: BookingStatus.CANCELLED })
        })
      ])
    )
  })
})
