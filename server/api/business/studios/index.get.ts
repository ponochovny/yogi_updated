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
import { getCachedReferenceData } from '~~/server/utils/reference-data-cache'

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
        __studioReferenceDataCache?: Record<
          string,
          {
            value?: unknown
            expiresAt: number
            promise?: Promise<unknown> | null
          }
        >
      }
    ).__studioReferenceDataCache ??= {})

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
        getCachedReferenceData<(typeof globalCategories.$inferSelect)[]>(
          // @ts-expect-error: TypeScript doesn't know the type of the cached data, but we know it will be the correct type based on the loader function.
          referenceDataCache,
          'categories',
          () => db.select().from(globalCategories)
        ),
        getCachedReferenceData<(typeof globalTypes.$inferSelect)[]>(
          // @ts-expect-error: TypeScript doesn't know the type of the cached data, but we know it will be the correct type based on the loader function.
          referenceDataCache,
          'types',
          () => db.select().from(globalTypes)
        ),
        getCachedReferenceData<(typeof globalCurrencies.$inferSelect)[]>(
          // @ts-expect-error: TypeScript doesn't know the type of the cached data, but we know it will be the correct type based on the loader function.
          referenceDataCache,
          'currencies',
          () => db.select().from(globalCurrencies)
        )
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
