import {
  pgTable,
  text,
  timestamp,
  integer,
  unique,
  uuid
} from 'drizzle-orm/pg-core'
import { user } from './auth-schema'
import { studios } from './studio'

export const studioWaiverConsents = pgTable(
  'studio_waiver_consents',
  {
    id: text('id').primaryKey(),
    studioId: uuid('studio_id')
      .notNull()
      .references(() => studios.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    waiverVersion: integer('waiver_version').notNull(),
    ipAddress: text('ip_address'),
    signedAt: timestamp('signed_at').defaultNow().notNull()
  },
  table => [unique().on(table.studioId, table.userId, table.waiverVersion)]
)
