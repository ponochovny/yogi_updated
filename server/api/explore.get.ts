import { offerings } from '~~/server/db/schema/offering'
import {
  studios,
  studioLocations,
  studioPractitioners
} from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import {
  and,
  eq,
  sql,
  ilike,
  or,
  isNull,
  inArray,
  desc,
  aliasedTable
} from 'drizzle-orm'
import { getEntityGallery } from '~~/server/utils/db-helpers'

export default defineEventHandler(async event => {
  const db = useDb()
  const query = getQuery(event)

  const type = (query.type as string) || 'offerings' // 'offerings' | 'studios' | 'practitioners'
  const category = query.category as string | undefined
  const date = query.date as string | undefined
  const timeOfDay = query.time as string | undefined // 'morning' | 'afternoon' | 'evening'
  const pricingType = query.pricingType as string | undefined // 'DROP_IN' | 'PACK' | 'MEMBERSHIP'
  const city = query.city as string | undefined
  const searchQuery = query.q as string | undefined
  const onlineOnly = query.online === 'true'
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(query.limit as string) || 12))
  const offset = (page - 1) * limit

  try {
    if (type === 'offerings') {
      return await fetchOfferings(db, {
        category,
        date,
        timeOfDay,
        pricingType,
        city,
        searchQuery,
        onlineOnly,
        limit,
        offset
      })
    } else if (type === 'studios') {
      return await fetchStudios(db, {
        category,
        city,
        searchQuery,
        limit,
        offset
      })
    } else if (type === 'practitioners') {
      return await fetchPractitioners(db, {
        city,
        searchQuery,
        limit,
        offset
      })
    }

    throwApiError(
      400,
      'Invalid type parameter. Use: offerings, studios, practitioners'
    )
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch explore data', error)
    throwApiError(500, 'Failed to fetch explore data')
  }
})

// ============================================
// OFFERINGS
// ============================================
interface OfferingFilters {
  category?: string
  date?: string
  timeOfDay?: string
  pricingType?: string
  city?: string
  searchQuery?: string
  onlineOnly: boolean
  limit: number
  offset: number
}

async function fetchOfferings(
  db: ReturnType<typeof useDb>,
  filters: OfferingFilters
) {
  const now = new Date()
  const studioLogo = aliasedTable(mediaFiles, 'studio_logo')

  const conditions = [eq(offerings.isPublished, true)]

  // Category filter
  if (filters.category) {
    conditions.push(sql`${filters.category} = ANY(${studios.categories})`)
  }

  // City filter
  if (filters.city) {
    conditions.push(ilike(studioLocations.city, `%${filters.city}%`))
  }

  // Search by name
  if (filters.searchQuery) {
    conditions.push(
      or(
        ilike(offerings.name, `%${filters.searchQuery}%`),
        ilike(offerings.description, `%${filters.searchQuery}%`)
      )!
    )
  }

  // Online only filter
  if (filters.onlineOnly) {
    conditions.push(isNull(offerings.locationId))
  }

  // Pricing type filter — check if the offering (or its studio) has a matching pricing option
  if (filters.pricingType) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM pricing_options po
        WHERE (po.offering_id = ${offerings.id} OR (po.studio_id = ${studios.id} AND po.offering_id IS NULL))
        AND po.is_active = true
        AND po.type = ${filters.pricingType}
      )`
    )
  }

  // Date filter — check if offering has a slot on this date
  if (filters.date) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM offering_slots os
        WHERE os.offering_id = ${offerings.id}
        AND os.status = 'ACTIVE'
        AND os.start_time::date = ${filters.date}::date
      )`
    )
  }

  // Time of day filter
  if (filters.timeOfDay) {
    let startHour = 0
    let endHour = 24
    if (filters.timeOfDay === 'morning') {
      startHour = 5
      endHour = 12
    } else if (filters.timeOfDay === 'afternoon') {
      startHour = 12
      endHour = 17
    } else if (filters.timeOfDay === 'evening') {
      startHour = 17
      endHour = 23
    }

    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM offering_slots os
        WHERE os.offering_id = ${offerings.id}
        AND os.status = 'ACTIVE'
        AND os.start_time > ${now.toISOString()}
        AND EXTRACT(HOUR FROM os.start_time) >= ${startHour}
        AND EXTRACT(HOUR FROM os.start_time) < ${endHour}
      )`
    )
  }

  // Count total
  const [totalResult] = await db
    .select({ count: sql<number>`count(DISTINCT ${offerings.id})::int` })
    .from(offerings)
    .innerJoin(studios, eq(offerings.studioId, studios.id))
    .leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
    .where(and(...conditions))

  const total = totalResult?.count ?? 0

  // Fetch offerings
  const data = await db
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
        logo: studioLogo.url
      },
      location: {
        name: studioLocations.name,
        city: studioLocations.city,
        country: studioLocations.country,
        address: studioLocations.address
      },
      // Min price
      minPrice: sql<number>`(
        SELECT COALESCE(MIN(po.price), 0)
        FROM pricing_options po
        WHERE (po.offering_id = ${offerings.id} OR (po.studio_id = ${studios.id} AND po.offering_id IS NULL))
        AND po.is_active = true
      )`,
      currency: studios.currency,
      // Nearest upcoming slot
      nearestSlotTime: sql<string>`(
        SELECT os.start_time FROM offering_slots os
        WHERE os.offering_id = ${offerings.id}
        AND os.start_time > ${now.toISOString()}
        AND os.status = 'ACTIVE'
        ORDER BY os.start_time ASC
        LIMIT 1
      )`,
      // Booked count on nearest slot
      bookedCount: sql<number>`(
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
    })
    .from(offerings)
    .innerJoin(studios, eq(offerings.studioId, studios.id))
    .leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
    .leftJoin(
      studioLogo,
      and(
        eq(studioLogo.entityId, sql`${studios.id}::text`),
        eq(studioLogo.entityType, MediaEntityTypeEnum.STUDIO),
        eq(studioLogo.type, MediaTypeEnum.LOGO)
      )
    )
    .where(and(...conditions))
    .orderBy(desc(offerings.createdAt))
    .limit(filters.limit)
    .offset(filters.offset)

  const items = data.map(o => ({
    ...o,
    spotsTotal: o.capacity,
    spotsBooked: o.bookedCount ?? 0,
    spotsRemaining: o.capacity ? o.capacity - (o.bookedCount ?? 0) : null
  }))

  return {
    success: true,
    type: 'offerings' as const,
    items,
    total,
    page: Math.floor(filters.offset / filters.limit) + 1,
    totalPages: Math.ceil(total / filters.limit)
  }
}

// ============================================
// STUDIOS
// ============================================
interface StudioFilters {
  category?: string
  city?: string
  searchQuery?: string
  limit: number
  offset: number
}

async function fetchStudios(
  db: ReturnType<typeof useDb>,
  filters: StudioFilters
) {
  const conditions = [eq(studios.isArchived, false)]

  if (filters.category) {
    conditions.push(sql`${filters.category} = ANY(${studios.categories})`)
  }

  if (filters.searchQuery) {
    conditions.push(
      or(
        ilike(studios.name, `%${filters.searchQuery}%`),
        ilike(studios.bio, `%${filters.searchQuery}%`)
      )!
    )
  }

  if (filters.city) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM studio_locations sl
        WHERE sl.studio_id = ${studios.id}
        AND sl.city ILIKE ${'%' + filters.city + '%'}
      )`
    )
  }

  // Count total
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(studios)
    .where(and(...conditions))
  const total = totalResult?.count ?? 0

  // Fetch studios
  const allStudios = await db
    .select({
      id: studios.id,
      name: studios.name,
      slug: studios.slug,
      bio: studios.bio,
      currency: studios.currency,
      categories: studios.categories,
      types: studios.types,
      offeringCount: sql<number>`(
        SELECT count(*)::int FROM offerings
        WHERE offerings.studio_id = studios.id AND offerings.is_published = true
      )`
    })
    .from(studios)
    .where(and(...conditions))
    .orderBy(desc(studios.createdAt))
    .limit(filters.limit)
    .offset(filters.offset)

  if (!allStudios.length) {
    return {
      success: true,
      type: 'studios' as const,
      items: [],
      total,
      page: 1,
      totalPages: 0
    }
  }

  const studioIds = allStudios.map(s => s.id)

  // Get locations & media
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

  const items = allStudios.map(studio => {
    const studioLocs = locations.filter(l => l.studioId === studio.id)
    const studioMedia = media.filter(m => m.entityId === studio.id)

    return {
      ...studio,
      logo: studioMedia.find(m => m.type === MediaTypeEnum.LOGO)?.url ?? null,
      gallery: studioMedia
        .filter(m => m.type === MediaTypeEnum.GALLERY)
        .map(m => m.url),
      locations: studioLocs.map(l => ({
        address: l.address,
        city: l.city,
        country: l.country
      }))
    }
  })

  return {
    success: true,
    type: 'studios' as const,
    items,
    total,
    page: Math.floor(filters.offset / filters.limit) + 1,
    totalPages: Math.ceil(total / filters.limit)
  }
}

// ============================================
// PRACTITIONERS
// ============================================
interface PractitionerFilters {
  city?: string
  searchQuery?: string
  limit: number
  offset: number
}

async function fetchPractitioners(
  db: ReturnType<typeof useDb>,
  filters: PractitionerFilters
) {
  const conditions = [eq(studioPractitioners.isActive, true)]

  if (filters.searchQuery) {
    conditions.push(ilike(user.name, `%${filters.searchQuery}%`))
  }

  if (filters.city) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM studio_locations sl
        WHERE sl.studio_id = ${studioPractitioners.studioId}
        AND sl.city ILIKE ${'%' + filters.city + '%'}
      )`
    )
  }

  // Count total
  const [totalResult] = await db
    .select({
      count: sql<number>`count(DISTINCT ${studioPractitioners.id})::int`
    })
    .from(studioPractitioners)
    .innerJoin(user, eq(studioPractitioners.userId, user.id))
    .innerJoin(studios, eq(studioPractitioners.studioId, studios.id))
    .where(and(...conditions))
  const total = totalResult?.count ?? 0

  // Fetch practitioners with their studio info
  const data = await db
    .select({
      id: studioPractitioners.id,
      userId: user.id,
      name: user.name,
      image: user.image,
      bio: user.bio,
      role: studioPractitioners.role,
      studio: {
        id: studios.id,
        name: studios.name,
        slug: studios.slug
      }
    })
    .from(studioPractitioners)
    .innerJoin(user, eq(studioPractitioners.userId, user.id))
    .innerJoin(studios, eq(studioPractitioners.studioId, studios.id))
    .where(and(...conditions))
    .orderBy(user.name)
    .limit(filters.limit)
    .offset(filters.offset)

  // Get avatars from media files
  const userIds = data.map(d => d.userId)
  const avatars = userIds.length
    ? await db
        .select({
          entityId: mediaFiles.entityId,
          url: mediaFiles.url
        })
        .from(mediaFiles)
        .where(
          and(
            inArray(mediaFiles.entityId, userIds),
            eq(mediaFiles.entityType, MediaEntityTypeEnum.USER),
            eq(mediaFiles.type, MediaTypeEnum.AVATAR)
          )
        )
    : []

  // Get locations for studio
  const studioIds = [...new Set(data.map(d => d.studio.id))]
  const locationsData = studioIds.length
    ? await db
        .select()
        .from(studioLocations)
        .where(inArray(studioLocations.studioId, studioIds))
    : []

  const items = data.map(p => ({
    ...p,
    avatar: p.image || avatars.find(a => a.entityId === p.userId)?.url || null,
    studioLocations: locationsData
      .filter(l => l.studioId === p.studio.id)
      .map(l => ({ city: l.city, country: l.country }))
  }))

  return {
    success: true,
    type: 'practitioners' as const,
    items,
    total,
    page: Math.floor(filters.offset / filters.limit) + 1,
    totalPages: Math.ceil(total / filters.limit)
  }
}
