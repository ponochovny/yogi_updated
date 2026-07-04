import { BookingStatus } from '../../app/entities/booking/schema'
import { TransactionProvider, TransactionStatus } from '../db/schema/payment'

export function getBookingTransactionState(price: number) {
  const isFreeFlow = price <= 0

  return {
    bookingStatus: isFreeFlow ? BookingStatus.CONFIRMED : BookingStatus.ACTIVE,
    transactionAmount: price,
    transactionProvider: isFreeFlow
      ? TransactionProvider.FREE
      : TransactionProvider.CASH,
    transactionStatus: isFreeFlow
      ? TransactionStatus.SUCCESS
      : TransactionStatus.PENDING
  }
}
