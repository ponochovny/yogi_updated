import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { offeringSlots } from './offering'
import { user } from './auth-schema'

export const bookings = pgTable('bookings', {
	id: uuid('id').defaultRandom().primaryKey(),

	// Link to the specific physical session
	slotId: uuid('slot_id')
		.notNull()
		.references(() => offeringSlots.id, { onDelete: 'cascade' }),

	// Link to the Better Auth user (client). Using text() to match Better Auth's string IDs
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),

	// Status of the booking
	status: varchar('status').default('CONFIRMED').notNull(), // CONFIRMED, CANCELLED, ATTENDED

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
