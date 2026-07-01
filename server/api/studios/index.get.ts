import { studios, studioLocations } from '~~/server/db/schema/studio'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { and, eq, inArray } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDb()

  try {
    const allStudios = await db
      .select({
        id: studios.id,
        name: studios.name,
        slug: studios.slug,
        bio: studios.bio,
        currency: studios.currency,
        mission: studios.mission,
        isArchived: studios.isArchived,
        categories: studios.categories,
        types: studios.types
      })
      .from(studios)
      .where(eq(studios.isArchived, false))

    if (!allStudios.length) {
      return { success: true, studios: [] }
    }

    const studioIds = allStudios.map(s => s.id)

    const [locations, media] = await Promise.all([
      db
        .select()
        .from(studioLocations)
        .where(inArray(studioLocations.studioId, studioIds)),
      db
        .select()
        .from(mediaFiles)
        .where(
          and(
            inArray(mediaFiles.entityId, studioIds),
            eq(mediaFiles.entityType, MediaEntityTypeEnum.STUDIO)
          )
        )
    ])

    const studiosWithDetails = allStudios.map(studio => {
      const studioLocs = locations.filter(l => l.studioId === studio.id)
      const studioMedia = media.filter(m => m.entityId === studio.id)

      const logo =
        studioMedia.filter(m => m.type === MediaTypeEnum.LOGO)[0]?.url || null
      const gallery = studioMedia
        .filter(m => m.type === MediaTypeEnum.GALLERY)
        .map(m => m.url)

      const studioLocationsFormatted = studioLocs.map(l => ({
        address: l.address,
        city: l.city,
        country: l.country
      }))

      return {
        ...studio,
        logo,
        gallery,
        locations: studioLocationsFormatted
      }
    })

    return { success: true, studios: studiosWithDetails }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch studios', error)
    throwApiError(500, 'Failed to fetch studios')
  }
})
