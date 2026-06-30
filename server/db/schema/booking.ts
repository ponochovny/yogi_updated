import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { offeringSlots } from './offering'
import { user } from './auth-schema'
import { BookingStatus } from '../../../app/entities/booking/schema'
import { transactions, userPasses } from './payment'

export const bookingStatusEnum = pgEnum('booking_status', [
	BookingStatus.CONFIRMED,
	BookingStatus.CANCELLED,
	BookingStatus.ATTENDED,
	BookingStatus.NO_SHOW,
])

export const bookings = pgTable('bookings', {
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
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
