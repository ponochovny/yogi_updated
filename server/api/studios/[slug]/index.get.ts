import {
  studios,
  studioLocations,
  studioPractitioners
} from '~~/server/db/schema/studio'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { globalCategories, globalTypes } from '~~/server/db/schema/global'
import { user } from '~~/server/db/schema/auth-schema'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const slug = requireRouteParam(event, 'slug')

  const db = useDb()

  try {
    const [studio] = await db
      .select()
      .from(studios)
      .where(eq(studios.slug, slug))
      .limit(1)

    if (!studio) {
      throwApiError(404, 'Studio not found')
    }

    const practitionerImg = sql`(
      SELECT url
      FROM media_files
      WHERE entity_id = ${user.id}::text
        AND entity_type = ${MediaEntityTypeEnum.USER}
        AND type = ${MediaTypeEnum.AVATAR}
      ORDER BY created_at DESC
      LIMIT 1
    ) practitioner_img`

    const [locations, media, categoriesData, typesData, practitioners] =
      await Promise.all([
        db
          .select()
          .from(studioLocations)
          .where(eq(studioLocations.studioId, studio.id)),
        db
          .select()
          .from(mediaFiles)
          .where(
            and(
              eq(mediaFiles.entityId, studio.id),
              eq(mediaFiles.entityType, MediaEntityTypeEnum.STUDIO)
            )
          )
          .orderBy(mediaFiles.order),
        db
          .select({ name: globalCategories.name })
          .from(globalCategories)
          .where(inArray(globalCategories.id, studio.categories || [])),
        db
          .select({ name: globalTypes.name })
          .from(globalTypes)
          .where(inArray(globalTypes.id, studio.types || [])),
        db
          .select({
            id: studioPractitioners.id,
            name: user.name,
            avatar: sql<string>`practitioner_img.url`
          })
          .from(studioPractitioners)
          .innerJoin(user, eq(studioPractitioners.userId, user.id))
          .leftJoinLateral(practitionerImg, sql`TRUE`)
          .where(
            and(
              eq(studioPractitioners.studioId, studio.id),
              eq(studioPractitioners.salaryActive, true),
              eq(studioPractitioners.role, userRoles.PRACTITIONER)
            )
          )
      ])

    const logo = media.find(file => file.type === MediaTypeEnum.LOGO) || null
    const gallery = media.filter(file => file.type === MediaTypeEnum.GALLERY)
    const categoryNames = categoriesData.map(c => c.name)
    const typeNames = typesData.map(c => c.name)

    return {
      success: true,
      studio: {
        ...studio,
        locations,
        logo: logo
          ? { url: logo.url, providerPublicId: logo.providerPublicId }
          : null,
        gallery: gallery.map(file => ({
          url: file.url,
          providerPublicId: file.providerPublicId
        })),
        categories: categoryNames,
        types: typeNames,

        practitioners: practitioners.map(practitioner => ({
          id: practitioner.id,
          name: practitioner.name,
          avatar: practitioner.avatar
        }))
      }
    }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch studio', error)
    throwApiError(500, 'Failed to fetch studio')
  }
})
