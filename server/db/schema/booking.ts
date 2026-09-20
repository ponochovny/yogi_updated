import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core'
import { offeringSlots } from './offering'
import { user } from './auth-schema'
import { BookingStatus } from '../../../app/entities/booking/schema'
import { transactions, userPasses } from './payment'
import { sql } from 'drizzle-orm'

export const bookingStatusEnum = pgEnum('booking_status', [
  BookingStatus.CONFIRMED,
  BookingStatus.CANCELLED,
  BookingStatus.ATTENDED,
  BookingStatus.NO_SHOW,
  BookingStatus.ACTIVE,
  BookingStatus.COMPLETED,
  BookingStatus.PENDING
])

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slotId: uuid('slot_id')
      .notNull()
      .references(() => offeringSlots.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    status: bookingStatusEnum('status')
      .default(BookingStatus.CONFIRMED)
      .notNull(),
    googleEventId: text('google_event_id'),

    /** Payment Information */
    userPassId: uuid('user_pass_id').references(() => userPasses.id), // If the customer used a pass
    transactionId: uuid('transaction_id').references(() => transactions.id), // If the customer chose single payment (cash/Stripe)

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  table => ({
    activeUserSlotUnique: uniqueIndex('bookings_active_user_slot_unique')
      .on(table.slotId, table.userId)
      .where(sql`status in ('PENDING', 'ACTIVE', 'CONFIRMED')`),
    slotStatusIndex: index('bookings_slot_id_status_idx').on(
      table.slotId,
      table.status
    ),
    userStatusIndex: index('bookings_user_id_status_idx').on(
      table.userId,
      table.status
    ),
    transactionIdIndex: index('bookings_transaction_id_idx').on(
      table.transactionId
    )
  })
)
