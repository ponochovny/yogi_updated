import { studios, studioLocations } from '~~/server/db/schema/studio'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { and, eq, inArray } from 'drizzle-orm'
import {
  globalCategories,
  globalCurrencies,
  globalTypes
} from '~~/server/db/schema/global'
import { resolveStudioMetadata } from '~~/server/utils/studio-metadata'

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
    const referenceDataCache = ((
      globalThis as typeof globalThis & {
        __studioReferenceDataCache?: {
          categories: Array<{ id: string; name: string; slug?: string }> | null
          types: Array<{ id: string; name: string; slug?: string }> | null
          currencies: Array<{ id: string; name: string; slug?: string }> | null
        }
      }
    ).__studioReferenceDataCache ??= {
      categories: null,
      types: null,
      currencies: null
    })

    const [locations, media, categoriesData, typesData, currenciesData] =
      await Promise.all([
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
          ),
        referenceDataCache.categories ??
          db
            .select()
            .from(globalCategories)
            .then(result => {
              referenceDataCache.categories = result
              return result
            }),
        referenceDataCache.types ??
          db
            .select()
            .from(globalTypes)
            .then(result => {
              referenceDataCache.types = result
              return result
            }),
        referenceDataCache.currencies ??
          db
            .select()
            .from(globalCurrencies)
            .then(result => {
              referenceDataCache.currencies = result
              return result
            })
      ])

    const studiosWithDetails = userStudios.map(studio => {
      const studioLocs = locations.filter(l => l.studioId === studio.id)
      const studioMedia = media.filter(m => m.entityId === studio.id)
      const { categories, types, currency } = resolveStudioMetadata(
        studio,
        categoriesData,
        typesData,
        currenciesData
      )

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
        categories,
        types,
        currency
      }
    })

    return { success: true, studios: studiosWithDetails }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch studios', error)
    throwApiError(500, 'Failed to fetch studios')
  }
})
