import {
	pgTable,
	varchar,
	text,
	timestamp,
	boolean,
	uuid,
	pgEnum,
	integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { studios, studioPractitioners, studioLocations } from './studio'
import {
	offeringType,
	pricingType,
	ActivityType,
	offeringSlotStatus,
} from '../../../app/entities/offering/schema'

export const offeringSlotStatusEnum = pgEnum('offering_slot_status', [
	offeringSlotStatus.ACTIVE,
	offeringSlotStatus.COMPLETED,
	offeringSlotStatus.CANCELLED,
])
export const offeringTypeEnum = pgEnum('offering_type', [
	offeringType.GROUP,
	offeringType.PRIVATE,
])
export const pricingTypeEnum = pgEnum('pricing_type', [
	pricingType.DROP_IN,
	pricingType.PACK,
	pricingType.MEMBERSHIP,
])
export const activityTypeEnum = pgEnum('activity_type', [
	ActivityType.CLASS,
	ActivityType.APPOINTMENT,
	ActivityType.EVENT,
])

export const offeringCategories = pgTable('offering_categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	studioId: uuid('studio_id')
		.notNull()
		.references(() => studios.id, { onDelete: 'cascade' }),
	name: varchar('name').notNull(), // Example: "Yoga", "Pilates", "Massage"
	color: varchar('color').default('#000000'), // For a beautiful UI in the calendar
})

export const offerings = pgTable('offerings', {
	id: uuid('id').defaultRandom().primaryKey(),
	slug: varchar('slug').notNull().unique(),
	studioId: uuid('studio_id')
		.notNull()
		.references(() => studios.id, { onDelete: 'cascade' }),
	categoryId: uuid('category_id').references(() => offeringCategories.id, {
		onDelete: 'set null',
	}),

	name: varchar('name').notNull(),
	description: text('description'),
	gallery: text('gallery').array().default([]),

	activityType: activityTypeEnum('activity_type').default('CLASS').notNull(),
	isPrivate: boolean('is_private').default(false).notNull(),

	locationId: uuid('location_id').references(() => studioLocations.id, {
		onDelete: 'set null',
	}),
	timezone: varchar('timezone').default('UTC').notNull(),

	type: offeringTypeEnum('type').default('GROUP').notNull(),

	// Basic settings
	duration: integer('duration').notNull(), // Duration in minutes (e.g., 60 or 90)
	capacity: integer('capacity'), // Seat limit. Null means unlimited (e.g., for online streams)

	isPublished: boolean('is_published').default(false).notNull(), // Draft or active
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// TODO: Prevent the same practitioner from being linked to the same offering multiple times
export const offeringPractitioners = pgTable('offering_practitioners', {
	id: uuid('id').defaultRandom().primaryKey(),
	offeringId: uuid('offering_id')
		.notNull()
		.references(() => offerings.id, { onDelete: 'cascade' }),
	practitionerId: uuid('practitioner_id')
		.notNull()
		.references(() => studioPractitioners.id, { onDelete: 'cascade' }),
})

export const pricingOptions = pgTable('pricing_options', {
	id: uuid('id').defaultRandom().primaryKey(),
	studioId: uuid('studio_id')
		.notNull()
		.references(() => studios.id, { onDelete: 'cascade' }),

	// If null, this membership/ticket applies to ALL offerings in the studio.
	// If specified, it only applies to a specific category (e.g., only "Yoga")
	categoryId: uuid('category_id').references(() => offeringCategories.id, {
		onDelete: 'set null',
	}),

	name: varchar('name').notNull(), // "Single Visit", "10-Class Package", "Unlimited Monthly"
	description: text('description'),
	type: pricingTypeEnum('type').notNull(),

	price: integer('price').notNull(), // In cents (e.g., 50000 for $500.00). Avoiding float for monetary values.

	// Limits logic
	credits: integer('credits'), // Visits amount. For DROP_IN = 1, PACK = 10, MEMBERSHIP = null (unlimited)
	durationDays: integer('duration_days').notNull(), // Duration of the pass after purchase (e.g., 1 day, 30 days, 365 days)

	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const offeringsRelations = relations(offerings, ({ one }) => ({
	studio: one(studios, {
		fields: [offerings.studioId],
		references: [studios.id],
	}),
	category: one(offeringCategories, {
		fields: [offerings.categoryId],
		references: [offeringCategories.id],
	}),
}))

export const pricingOptionsRelations = relations(pricingOptions, ({ one }) => ({
	studio: one(studios, {
		fields: [pricingOptions.studioId],
		references: [studios.id],
	}),
	category: one(offeringCategories, {
		fields: [pricingOptions.categoryId],
		references: [offeringCategories.id],
	}),
}))

// This table will store specific time slots for each offering (e.g., a Yoga class on Mondays at 6 PM). It allows for exceptions like cancellations or capacity overrides.
export const offeringSlots = pgTable('offering_slots', {
	id: uuid('id').defaultRandom().primaryKey(),
	offeringId: uuid('offering_id')
		.notNull()
		.references(() => offerings.id, { onDelete: 'cascade' }),
	practitionerId: uuid('practitioner_id')
		.notNull()
		.references(() => studioPractitioners.id),
	startTime: timestamp('start_time', { withTimezone: true }).notNull(),
	endTime: timestamp('end_time', { withTimezone: true }).notNull(),
	status: offeringSlotStatusEnum('status').default('ACTIVE').notNull(),
	googleEventId: text('google_event_id'),
	capacityOverride: integer('capacity_override'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})
