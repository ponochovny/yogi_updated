import {
	pgTable,
	uuid,
	text,
	integer,
	// boolean,
	timestamp,
	// primaryKey,
} from 'drizzle-orm/pg-core'
// import { user } from './auth-schema'

// ==========================================
// OFFERINGS AND SCHEDULES
// ==========================================
// export const offerings = pgTable('offerings', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	slug: text('slug').notNull().unique(),
// 	activity: text('activity').notNull(),
// 	name: text('name').notNull(),
// 	description: text('description').notNull(),
// 	isPrivate: boolean('is_private').default(false).notNull(),
// 	isActive: boolean('is_active').default(true).notNull(),
// 	types: text('types').array(),
// 	categories: text('categories').array(),
// 	studioId: uuid('studio_id')
// 		.notNull()
// 		.references(() => studios.id, { onDelete: 'cascade' }),

// 	locationId: uuid('location_id').references(() => studioLocations.id, {
// 		onDelete: 'set null',
// 	}),

// 	createdAt: timestamp('created_at').defaultNow().notNull(),
// 	updatedAt: timestamp('updated_at').defaultNow().notNull(),
// })

// Offering <-> Practitioner (Many-to-Many)
// export const offeringPractitioners = pgTable(
// 	'offering_practitioners',
// 	{
// 		offeringId: uuid('offering_id')
// 			.notNull()
// 			.references(() => offerings.id, { onDelete: 'cascade' }),
// 		studioPractitionerId: uuid('studio_practitioner_id')
// 			.notNull()
// 			.references(() => studioPractitioners.id, { onDelete: 'cascade' }),
// 	},
// 	(table) => [
// 		{
// 			pk: primaryKey({
// 				columns: [table.offeringId, table.studioPractitionerId],
// 			}),
// 		},
// 	],
// )

// Table of specific time slots for recording (Overbooking protection)
// export const bookingSlots = pgTable('booking_slots', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	start: timestamp('start').notNull(),
// 	end: timestamp('end').notNull(),
// 	duration: integer('duration').notNull(), // В минутах
// 	totalSpots: integer('total_spots').notNull(),
// 	isRoomFull: boolean('is_room_full').default(false).notNull(),
// 	offeringId: uuid('offering_id')
// 		.notNull()
// 		.references(() => offerings.id, { onDelete: 'cascade' }),
// })

// export const tickets = pgTable('tickets', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	name: text('name').notNull(),
// 	description: text('description').notNull(),
// 	price: integer('price').notNull(),
// 	currency: text('currency').notNull(),
// 	offeringId: uuid('offering_id')
// 		.notNull()
// 		.references(() => offerings.id, { onDelete: 'cascade' }),
// })

// ==========================================
// CHECKOUT, PROMO CODES AND SUBSCRIPTIONS
// ==========================================

// export const purchases = pgTable('purchases', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	status: text('status').default('PENDING').notNull(), // PENDING, PAID, CANCELLED
// 	amount: integer('amount').notNull(),
// 	currency: text('currency').notNull(),
// 	paymentId: text('payment_id').unique(),
// 	receiptEmail: text('receipt_email').notNull(),
// 	userName: text('user_name'),
// 	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
// 	ticketId: uuid('ticket_id')
// 		.notNull()
// 		.references(() => tickets.id),
// 	slotId: uuid('slot_id')
// 		.notNull()
// 		.references(() => bookingSlots.id),
// 	promocodeId: uuid('promocode_id').references(() => promocodes.id),
// 	createdAt: timestamp('created_at').defaultNow().notNull(),
// })

// export const promocodes = pgTable('promocodes', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	code: text('code').notNull().unique(),
// 	discount: integer('discount').notNull(),
// 	isPercent: boolean('is_percent').default(true).notNull(),
// 	isActive: boolean('is_active').default(true).notNull(),
// 	studioId: uuid('studio_id')
// 		.notNull()
// 		.references(() => studios.id, { onDelete: 'cascade' }),
// 	expiresAt: timestamp('expires_at'),
// })

// export const memberships = pgTable('memberships', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	name: text('name').notNull(),
// 	description: text('description').notNull(),
// 	price: integer('price').notNull(),
// 	durationDays: integer('duration_days').notNull(),
// 	slotsLimit: integer('slots_limit').notNull(),
// 	studioId: uuid('studio_id')
// 		.notNull()
// 		.references(() => studios.id, { onDelete: 'cascade' }),
// })

// export const userMemberships = pgTable('user_memberships', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	userId: text('user_id')
// 		.notNull()
// 		.references(() => user.id, { onDelete: 'cascade' }),
// 	membershipId: uuid('membership_id')
// 		.notNull()
// 		.references(() => memberships.id, { onDelete: 'cascade' }),
// 	remainingSlots: integer('remaining_slots').notNull(),
// 	expiresAt: timestamp('expires_at').notNull(),
// 	isActive: boolean('is_active').default(true).notNull(),
// 	createdAt: timestamp('created_at').defaultNow().notNull(),
// })

// ==========================================
// CHARITY, TIPS, REVIEWS AND MEDIA
// ==========================================

// export const causes = pgTable('causes', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	slug: text('slug').notNull().unique(),
// 	name: text('name').notNull(),
// 	description: text('description').notNull(),
// 	targetAmount: integer('target_amount').notNull(),
// 	currentAmount: integer('current_amount').default(0).notNull(),
// 	isActive: boolean('is_active').default(true).notNull(),
// 	studioId: uuid('studio_id')
// 		.notNull()
// 		.references(() => studios.id, { onDelete: 'cascade' }),
// })

// export const donations = pgTable('donations', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	amount: integer('amount').notNull(),
// 	causeId: uuid('cause_id')
// 		.notNull()
// 		.references(() => causes.id, { onDelete: 'cascade' }),
// 	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
// 	purchaseId: uuid('purchase_id').references(() => purchases.id, {
// 		onDelete: 'set null',
// 	}),
// 	createdAt: timestamp('created_at').defaultNow().notNull(),
// })

// export const tips = pgTable('tips', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	amount: integer('amount').notNull(),
// 	currency: text('currency').notNull(),
// 	senderId: text('sender_id').references(() => user.id, {
// 		onDelete: 'set null',
// 	}),
// 	receiverId: text('receiver_id')
// 		.notNull()
// 		.references(() => user.id, { onDelete: 'cascade' }), // Practitioner's ID
// 	studioPractitionerId: uuid('studio_practitioner_id')
// 		.notNull()
// 		.references(() => studioPractitioners.id),
// 	createdAt: timestamp('created_at').defaultNow().notNull(),
// })

// export const reviews = pgTable('reviews', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	rating: integer('rating').notNull(), // 1-5
// 	text: text('text').notNull(),
// 	userId: text('user_id')
// 		.notNull()
// 		.references(() => user.id, { onDelete: 'cascade' }),
// 	studioId: uuid('studio_id').references(() => studios.id, {
// 		onDelete: 'cascade',
// 	}),
// 	offeringId: uuid('offering_id').references(() => offerings.id, {
// 		onDelete: 'cascade',
// 	}),
// 	studioPractitionerId: uuid('studio_practitioner_id').references(
// 		() => studioPractitioners.id,
// 		{ onDelete: 'cascade' },
// 	),
// 	createdAt: timestamp('created_at').defaultNow().notNull(),
// })

export const mediaFiles = pgTable('media_files', {
	id: uuid('id').defaultRandom().primaryKey(),
	url: text('url').notNull(),
	providerPublicId: text('provider_public_id').notNull(),

	entityId: uuid('entity_id').notNull(), // Studio ID, Offering ID or User ID
	entityType: text('entity_type').notNull(), // 'STUDIO', 'OFFERING', 'USER'

	type: text('type').notNull(), // 'LOGO', 'GALLERY', 'AVATAR'

	order: integer('order').default(0), // To sort media files in a specific order (e.g., for gallery images)
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

// export const tags = pgTable('tags', {
// 	id: uuid('id').defaultRandom().primaryKey(),
// 	name: text('name').notNull(),
// 	studioId: uuid('studio_id').references(() => studios.id, {
// 		onDelete: 'cascade',
// 	}),
// })
