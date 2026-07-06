import { studios, studioLocations } from '~~/server/db/schema/studio'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { and, eq, inArray, sql } from 'drizzle-orm'
import {
  globalCategories,
  globalCurrencies,
  globalTypes
} from '~~/server/db/schema/global'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const currentUserId = userData.id
  const db = useDb()

  try {
    const userStudios = await db
      .select()
      .from(studios)
      .where(eq(studios.ownerId, currentUserId))

    if (!userStudios.length) {
      return { success: true, studios: [] }
    }

    const studioIds = userStudios.map(s => s.id)

    const [locations, media, categoriesData, typesData, currenciesData] =
      await Promise.all([
        db
          .select()
          .from(studioLocations)
          .where(sql`${studioLocations.studioId} IN ${studioIds}`),
        db
          .select()
          .from(mediaFiles)
          .where(
            and(
              inArray(mediaFiles.entityId, studioIds),
              eq(mediaFiles.entityType, MediaEntityTypeEnum.STUDIO)
            )
          ),
        db.select().from(globalCategories),
        db.select().from(globalTypes),
        db.select().from(globalCurrencies)
      ])

    const studiosWithDetails = userStudios.map(studio => {
      const studioLocs = locations.filter(l => l.studioId === studio.id)
      const studioMedia = media.filter(m => m.entityId === studio.id)
      const studioCategoryIds = studio.categories || []
      const studioTypeIds = studio.types || []
      const categoryNames = categoriesData
        .filter(c => studioCategoryIds.includes(c.id))
        .map(c => c.name)
      const typeNames = typesData
        .filter(t => studioTypeIds.includes(t.id))
        .map(t => t.name)
      const currencyName =
        currenciesData.find(c => c.id === studio.currency)?.name || null

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
        locations: studioLocationsFormatted,
        categories: categoryNames,
        types: typeNames,
        currency: currencyName
      }
    })

    return { success: true, studios: studiosWithDetails }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch studios', error)
    throwApiError(500, 'Failed to fetch studios')
  }
})
