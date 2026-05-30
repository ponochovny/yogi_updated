import {
	pgTable,
	uuid,
	text,
	integer,
	boolean,
	timestamp,
	primaryKey,
} from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

// ==========================================
// СТУДИИ И ПРАКТИКИ (БИЗНЕС)
// ==========================================

export const studios = pgTable('studios', {
	id: uuid('id').defaultRandom().primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	location: text('location').notNull(),
	timezone: text('timezone').notNull(),
	currency: text('currency').notNull(),
	categories: text('categories').array(),
	types: text('types').array(),
	bio: text('bio').notNull(),
	mission: text('mission').notNull(),
	isArchived: boolean('is_archived').default(false).notNull(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Промежуточная таблица связи Студия <-> Практик (Many-to-Many)
export const studioPractitioners = pgTable('studio_practitioners', {
	id: uuid('id').defaultRandom().primaryKey(),
	studioId: uuid('studio_id')
		.notNull()
		.references(() => studios.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	salaryActive: boolean('salary_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==========================================
// ОФФЕРИНГИ И РАСПИСАНИЕ
// ==========================================

export const offerings = pgTable('offerings', {
	id: uuid('id').defaultRandom().primaryKey(),
	slug: text('slug').notNull().unique(),
	activity: text('activity').notNull(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	isPrivate: boolean('is_private').default(false).notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	types: text('types').array(),
	categories: text('categories').array(),
	studioId: uuid('studio_id')
		.notNull()
		.references(() => studios.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Связь Офферинг <-> Конкретный Практик студии (Many-to-Many)
export const offeringPractitioners = pgTable(
	'offering_practitioners',
	{
		offeringId: uuid('offering_id')
			.notNull()
			.references(() => offerings.id, { onDelete: 'cascade' }),
		studioPractitionerId: uuid('studio_practitioner_id')
			.notNull()
			.references(() => studioPractitioners.id, { onDelete: 'cascade' }),
	},
	(table) => [
		{
			pk: primaryKey({
				columns: [table.offeringId, table.studioPractitionerId],
			}),
		},
	],
)

// Таблица конкретных временных слотов для записи (Защита от овербукинга)
export const bookingSlots = pgTable('booking_slots', {
	id: uuid('id').defaultRandom().primaryKey(),
	start: timestamp('start').notNull(),
	end: timestamp('end').notNull(),
	duration: integer('duration').notNull(), // В минутах
	totalSpots: integer('total_spots').notNull(),
	isRoomFull: boolean('is_room_full').default(false).notNull(),
	offeringId: uuid('offering_id')
		.notNull()
		.references(() => offerings.id, { onDelete: 'cascade' }),
})

export const tickets = pgTable('tickets', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	price: integer('price').notNull(), // Храним в копейках/центах (например, 1500 вместо 15.00)
	currency: text('currency').notNull(),
	offeringId: uuid('offering_id')
		.notNull()
		.references(() => offerings.id, { onDelete: 'cascade' }),
})

// ==========================================
// ЧЕКАУТ, ПРОМОКОДЫ И АБОНЕМЕНТЫ
// ==========================================

export const purchases = pgTable('purchases', {
	id: uuid('id').defaultRandom().primaryKey(),
	status: text('status').default('PENDING').notNull(), // PENDING, PAID, CANCELLED
	amount: integer('amount').notNull(),
	currency: text('currency').notNull(),
	paymentId: text('payment_id').unique(),
	receiptEmail: text('receipt_email').notNull(),
	userName: text('user_name'),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	ticketId: uuid('ticket_id')
		.notNull()
		.references(() => tickets.id),
	slotId: uuid('slot_id')
		.notNull()
		.references(() => bookingSlots.id),
	promocodeId: uuid('promocode_id').references(() => promocodes.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const promocodes = pgTable('promocodes', {
	id: uuid('id').defaultRandom().primaryKey(),
	code: text('code').notNull().unique(),
	discount: integer('discount').notNull(),
	isPercent: boolean('is_percent').default(true).notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	studioId: uuid('studio_id')
		.notNull()
		.references(() => studios.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at'),
})

export const memberships = pgTable('memberships', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	price: integer('price').notNull(),
	durationDays: integer('duration_days').notNull(),
	slotsLimit: integer('slots_limit').notNull(),
	studioId: uuid('studio_id')
		.notNull()
		.references(() => studios.id, { onDelete: 'cascade' }),
})

export const userMemberships = pgTable('user_memberships', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	membershipId: uuid('membership_id')
		.notNull()
		.references(() => memberships.id, { onDelete: 'cascade' }),
	remainingSlots: integer('remaining_slots').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ==========================================
// БЛАГОТВОРИТЕЛЬНОСТЬ, ЧАЕВЫЕ, ОТЗЫВЫ И МЕДИА
// ==========================================

export const causes = pgTable('causes', {
	id: uuid('id').defaultRandom().primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	targetAmount: integer('target_amount').notNull(),
	currentAmount: integer('current_amount').default(0).notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	studioId: uuid('studio_id')
		.notNull()
		.references(() => studios.id, { onDelete: 'cascade' }),
})

export const donations = pgTable('donations', {
	id: uuid('id').defaultRandom().primaryKey(),
	amount: integer('amount').notNull(),
	causeId: uuid('cause_id')
		.notNull()
		.references(() => causes.id, { onDelete: 'cascade' }),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	purchaseId: uuid('purchase_id').references(() => purchases.id, {
		onDelete: 'set null',
	}),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tips = pgTable('tips', {
	id: uuid('id').defaultRandom().primaryKey(),
	amount: integer('amount').notNull(),
	currency: text('currency').notNull(),
	senderId: text('sender_id').references(() => user.id, {
		onDelete: 'set null',
	}),
	receiverId: text('receiver_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }), // ID Практика
	studioPractitionerId: uuid('studio_practitioner_id')
		.notNull()
		.references(() => studioPractitioners.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const reviews = pgTable('reviews', {
	id: uuid('id').defaultRandom().primaryKey(),
	rating: integer('rating').notNull(), // 1-5
	text: text('text').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	studioId: uuid('studio_id').references(() => studios.id, {
		onDelete: 'cascade',
	}),
	offeringId: uuid('offering_id').references(() => offerings.id, {
		onDelete: 'cascade',
	}),
	studioPractitionerId: uuid('studio_practitioner_id').references(
		() => studioPractitioners.id,
		{ onDelete: 'cascade' },
	),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const mediaFiles = pgTable('media_files', {
	id: uuid('id').defaultRandom().primaryKey(),
	url: text('url').notNull(),
	providerPublicId: text('provider_public_id').notNull(),
	order: integer('order').default(0),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
	logoStudioId: uuid('logo_studio_id').references(() => studios.id, {
		onDelete: 'cascade',
	}),
	bannerStudioId: uuid('banner_studio_id').references(() => studios.id, {
		onDelete: 'cascade',
	}),
	bannerOfferingId: uuid('banner_offering_id').references(() => offerings.id, {
		onDelete: 'cascade',
	}),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tags = pgTable('tags', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	studioId: uuid('studio_id').references(() => studios.id, {
		onDelete: 'cascade',
	}),
})
