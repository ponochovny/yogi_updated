import {
	pgTable,
	uuid,
	text,
	boolean,
	timestamp,
	pgEnum,
	unique,
} from 'drizzle-orm/pg-core'
import { user } from './auth-schema'
import { userRoles } from '../../auth/config'

export const studioRoleEnum = pgEnum('studio_role', [
	userRoles.MANAGER,
	userRoles.PRACTITIONER,
	userRoles.BUSINESS,
])

// ==========================================
// STUDIOS AND PRACTITIONERS (BUSINESS)
// ==========================================

export const studios = pgTable('studios', {
	id: uuid('id').defaultRandom().primaryKey(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	currency: text('currency').notNull(),
	bio: text('bio').notNull(),
	mission: text('mission').notNull(),
	isArchived: boolean('is_archived').default(false).notNull(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	categories: text('categories').array(),
	types: text('types').array(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const studioPractitioners = pgTable(
	'studio_practitioners',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		studioId: uuid('studio_id')
			.notNull()
			.references(() => studios.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),

		role: studioRoleEnum('role').default(userRoles.PRACTITIONER).notNull(),

		salaryActive: boolean('salary_active').default(true).notNull(),
		isActive: boolean('is_active').default(true).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [unique().on(table.studioId, table.userId)],
)

export const studioLocations = pgTable(
	'studio_locations',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		studioId: uuid('studio_id')
			.notNull()
			.references(() => studios.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		country: text('country').notNull(),
		city: text('city').notNull(),
		address: text('address').notNull(),
		timezone: text('timezone').default('UTC').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [unique().on(table.id, table.studioId)],
)

export const studioMembers = pgTable(
	'studio_members',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		studioId: uuid('studio_id')
			.notNull()
			.references(() => studios.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		role: studioRoleEnum('role').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [unique().on(table.studioId, table.userId, table.role)],
)
