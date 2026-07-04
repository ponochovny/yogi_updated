import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum
} from 'drizzle-orm/pg-core'

export const MediaEntityTypeEnum = {
  OFFERING: 'OFFERING',
  STUDIO: 'STUDIO',
  USER: 'USER'
} as const
// export type MediaEntityTypeEnum = (typeof mediaEntityTypeEnum.enumValues)[number]

export const MediaTypeEnum = {
  GALLERY: 'GALLERY',
  LOGO: 'LOGO',
  AVATAR: 'AVATAR'
} as const
// export type MediaTypeEnum = (typeof mediaTypeEnum.enumValues)[number]

export const mediaEntityTypeEnum = pgEnum('media_entity_type', [
  MediaEntityTypeEnum.OFFERING,
  MediaEntityTypeEnum.STUDIO,
  MediaEntityTypeEnum.USER
])

export const mediaTypeEnum = pgEnum('media_type', [
  MediaTypeEnum.GALLERY,
  MediaTypeEnum.LOGO,
  MediaTypeEnum.AVATAR
])

export const mediaFiles = pgTable('media_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  providerPublicId: text('provider_public_id').notNull(),

  entityId: text('entity_id').notNull(), // Studio ID, Offering ID or User ID
  // entityType: text('entity_type').notNull(), // 'STUDIO', 'OFFERING', 'USER'
  entityType: mediaEntityTypeEnum('entity_type').notNull(),

  type: mediaTypeEnum('type').notNull(), // 'LOGO', 'GALLERY', 'AVATAR'

  order: integer('order').default(0), // To sort media files in a specific order (e.g., for gallery images)
  createdAt: timestamp('created_at').defaultNow().notNull()
})
