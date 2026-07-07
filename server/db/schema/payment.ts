import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'
import { studios } from './studio'
import { pricingOptions } from './offering'
import { user } from './auth-schema'

export const UserPassStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  EXHAUSTED: 'EXHAUSTED',
  CANCELLED: 'CANCELLED'
} as const

export const passStatusEnum = pgEnum('pass_status', [
  UserPassStatus.ACTIVE,
  UserPassStatus.EXPIRED,
  UserPassStatus.EXHAUSTED,
  UserPassStatus.CANCELLED
])

export const TransactionProvider = {
  STRIPE: 'STRIPE',
  LIQPAY: 'LIQPAY',
  HUTKO: 'HUTKO',
  MONOPAY: 'MONOPAY',
  CASH: 'CASH',
  FREE: 'FREE'
} as const

export const paymentProviderEnum = pgEnum('payment_provider', [
  TransactionProvider.STRIPE,
  TransactionProvider.LIQPAY,
  TransactionProvider.HUTKO,
  TransactionProvider.MONOPAY,
  TransactionProvider.CASH,
  TransactionProvider.FREE
])

export const TransactionStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const

export const transactionStatusEnum = pgEnum('transaction_status', [
  TransactionStatus.PENDING,
  TransactionStatus.SUCCESS,
  TransactionStatus.FAILED,
  TransactionStatus.REFUNDED
])

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  studioId: uuid('studio_id')
    .notNull()
    .references(() => studios.id, { onDelete: 'cascade' }),

  amount: integer('amount').notNull(), // In cents, e.g. 1000 = $10.00
  currency: text('currency').notNull(), // 'USD', 'UAH' and so on

  provider: paymentProviderEnum('provider').notNull(),
  providerTransactionId: text('provider_transaction_id'), // For external IDs from Stripe/LiqPay

  status: transactionStatusEnum('status').default('PENDING').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const userPasses = pgTable('user_passes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  studioId: uuid('studio_id')
    .notNull()
    .references(() => studios.id, { onDelete: 'cascade' }),

  pricingOptionId: uuid('pricing_option_id')
    .notNull()
    .references(() => pricingOptions.id),

  transactionId: uuid('transaction_id').references(() => transactions.id), // Link to the transaction that paid for this pass

  status: passStatusEnum('status').default(UserPassStatus.ACTIVE).notNull(),

  remainingCredits: integer('remaining_credits'), // Null = unlimited, number = remaining sessions
  validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})
