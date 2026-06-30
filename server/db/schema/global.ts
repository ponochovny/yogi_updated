import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'

export const globalCategories = pgTable('global_categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 100 }).notNull(), // "Yoga", "Crossfit", "Dancing"
	slug: varchar('slug', { length: 100 }).notNull().unique(), // "yoga", "crossfit"
})

export const globalTypes = pgTable('global_types', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 100 }).notNull(), // "Yoga", "Crossfit", "Dancing"
	slug: varchar('slug', { length: 100 }).notNull().unique(), // "yoga", "crossfit"
})

export const globalCurrencies = pgTable('global_currencies', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 100 }).notNull(), // "USD", "EUR"
	slug: varchar('slug', { length: 100 }).notNull().unique(), // "usd", "eur"
})
