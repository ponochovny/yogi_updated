import { offerings } from '~~/server/db/schema/offering'
import { studios, studioLocations } from '~~/server/db/schema/studio'
import { globalCategories } from '~~/server/db/schema/global'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import {
  and,
  eq,
  sql,
  desc,
  asc,
  isNull,
  aliasedTable,
  inArray
} from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { getEntityGallery } from '~~/server/utils/db-helpers'

export default defineEventHandler(async () => {
  const db = useDb()

  try {
    // 1. Popular Categories with studio count
    const popularCategories = await db
      .select({
        id: globalCategories.id,
        name: globalCategories.name,
        slug: globalCategories.slug,
        studioCount: sql<number>`count(${studios.id})::int`
      })
      .from(globalCategories)
      .leftJoin(
        studios,
        and(
          sql`${globalCategories.id} = ANY(${studios.categories})`,
          eq(studios.isArchived, false)
        )
      )
      .groupBy(
        globalCategories.id,
        globalCategories.name,
        globalCategories.slug
      )

    // 2. Popular Studios — top 6 by offering count
    const studioLogo = aliasedTable(mediaFiles, 'studio_logo')

    const popularStudiosRaw = await db
      .select({
        id: studios.id,
        name: studios.name,
        slug: studios.slug,
        bio: studios.bio,
        categories: studios.categories,
        types: studios.types,
        logo: studioLogo.url,
        offeringCount: sql<number>`count(${offerings.id})::int`
      })
      .from(studios)
      .leftJoin(
        offerings,
        and(eq(offerings.studioId, studios.id), eq(offerings.isPublished, true))
      )
      .leftJoin(
        studioLogo,
        and(
          eq(studioLogo.entityId, sql`${studios.id}::text`),
          eq(studioLogo.entityType, MediaEntityTypeEnum.STUDIO),
          eq(studioLogo.type, MediaTypeEnum.LOGO)
        )
      )
      .where(eq(studios.isArchived, false))
      .groupBy(studios.id, studioLogo.url)
      .orderBy(desc(sql`count(${offerings.id})`))
      .limit(6)

    // Get locations for popular studios
    const popularStudioIds = popularStudiosRaw.map(s => s.id)
    const studioLocationsData = popularStudioIds.length
      ? await db
          .select()
          .from(studioLocations)
          .where(inArray(studioLocations.studioId, popularStudioIds))
      : []

    // Get gallery for popular studios
    const studioGalleryData = popularStudioIds.length
      ? await db
          .select({
            entityId: mediaFiles.entityId,
            url: mediaFiles.url,
            order: mediaFiles.order
          })
          .from(mediaFiles)
          .where(
            and(
              inArray(mediaFiles.entityId, popularStudioIds),
              eq(mediaFiles.entityType, MediaEntityTypeEnum.STUDIO),
              eq(mediaFiles.type, MediaTypeEnum.GALLERY)
            )
          )
      : []

    const popularStudios = popularStudiosRaw.map(studio => ({
      ...studio,
      locations: studioLocationsData
        .filter(l => l.studioId === studio.id)
        .map(l => ({ address: l.address, city: l.city, country: l.country })),
      gallery: studioGalleryData
        .filter(m => m.entityId === studio.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(m => m.url)
    }))

    // 3. Popular Offerings — classes filling up fast (< 50% spots remaining on nearest slot)
    const now = new Date()
    const offeringStudioLogo = aliasedTable(mediaFiles, 'offering_studio_logo')

    const fetchOfferings = async (
      locationCondition: SQL,
      popularOnly = false,
      resultLimit = 6
    ) => {
      const bookedCount = sql<number>`(
        SELECT COALESCE(count(b.id)::int, 0)
        FROM bookings b
        JOIN offering_slots os ON b.slot_id = os.id
        WHERE os.offering_id = ${offerings.id}
        AND os.start_time > ${now.toISOString()}
        AND os.status = 'ACTIVE'
        AND b.status NOT IN ('CANCELLED')
        AND os.start_time = (
          SELECT MIN(os2.start_time) FROM offering_slots os2
          WHERE os2.offering_id = ${offerings.id}
          AND os2.start_time > ${now.toISOString()}
          AND os2.status = 'ACTIVE'
        )
      )`
      const remainingSpots = sql<number>`${offerings.capacity} - ${bookedCount}`
      const availabilityConditions: SQL[] = [
        eq(offerings.isPublished, true),
        locationCondition,
        sql`${offerings.capacity} > 0`,
        sql`EXISTS (
          SELECT 1 FROM offering_slots os
          WHERE os.offering_id = ${offerings.id}
          AND os.start_time > ${now.toISOString()}
          AND os.status = 'ACTIVE'
        )`,
        sql`${remainingSpots} > 0`
      ]

      if (popularOnly) {
        availabilityConditions.push(
          sql`${remainingSpots} < ${offerings.capacity} * 0.5`
        )
      }

      return db
        .select({
          id: offerings.id,
          name: offerings.name,
          slug: offerings.slug,
          description: offerings.description,
          activityType: offerings.activityType,
          duration: offerings.duration,
          capacity: offerings.capacity,
          locationId: offerings.locationId,
          gallery: getEntityGallery(
            offerings.id,
            MediaEntityTypeEnum.OFFERING,
            MediaTypeEnum.GALLERY
          ),
          studio: {
            name: studios.name,
            slug: studios.slug,
            logo: offeringStudioLogo.url
          },
          location: {
            name: studioLocations.name,
            city: studioLocations.city,
            country: studioLocations.country,
            address: studioLocations.address
          },
          // Nearest upcoming slot info
          nearestSlotId: sql<string>`(
          SELECT os.id FROM offering_slots os
          WHERE os.offering_id = ${offerings.id}
          AND os.start_time > ${now.toISOString()}
          AND os.status = 'ACTIVE'
          ORDER BY os.start_time ASC
          LIMIT 1
        )`,
          nearestSlotTime: sql<string>`(
          SELECT os.start_time FROM offering_slots os
          WHERE os.offering_id = ${offerings.id}
          AND os.start_time > ${now.toISOString()}
          AND os.status = 'ACTIVE'
          ORDER BY os.start_time ASC
          LIMIT 1
        )`,
          bookedCount,
          remainingSpots,
          // Min price from pricing options
          minPrice: sql<number>`(
          SELECT COALESCE(MIN(po.price), 0)
          FROM pricing_options po
          WHERE (po.offering_id = ${offerings.id} OR (po.studio_id = ${studios.id} AND po.offering_id IS NULL))
          AND po.is_active = true
        )`,
          currency: studios.currency
        })
        .from(offerings)
        .innerJoin(studios, eq(offerings.studioId, studios.id))
        .leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
        .leftJoin(
          offeringStudioLogo,
          and(
            eq(offeringStudioLogo.entityId, sql`${studios.id}::text`),
            eq(offeringStudioLogo.entityType, MediaEntityTypeEnum.STUDIO),
            eq(offeringStudioLogo.type, MediaTypeEnum.LOGO)
          )
        )
        .where(and(...availabilityConditions))
        .orderBy(asc(remainingSpots))
        .limit(resultLimit)
    }

    const popularOfferings = (await fetchOfferings(sql`true`, true)).map(o => ({
      ...o,
      spotsTotal: o.capacity,
      spotsBooked: o.bookedCount ?? 0,
      spotsRemaining: o.remainingSpots
    }))

    // 4. Online Offerings — where locationId is null
    const onlineOfferings = (
      await fetchOfferings(isNull(offerings.locationId), false, 4)
    ).map(o => ({
      ...o,
      spotsTotal: o.capacity,
      spotsBooked: o.bookedCount ?? 0,
      spotsRemaining: o.remainingSpots
    }))

    return {
      success: true,
      data: {
        popularCategories,
        popularStudios,
        popularOfferings,
        onlineOfferings
      }
    }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch home data', error)
    throwApiError(500, 'Failed to fetch home page data')
  }
})
