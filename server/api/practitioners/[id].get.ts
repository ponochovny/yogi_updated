import { and, eq, inArray, sql } from 'drizzle-orm'
import { user } from '~~/server/db/schema/auth-schema'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { offerings, offeringPractitioners } from '~~/server/db/schema/offering'
import {
  studioLocations,
  studioPractitioners,
  studios
} from '~~/server/db/schema/studio'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const practitionerId = requireRouteParam(event, 'id')
  const db = useDb()

  try {
    const [practitioner] = await db
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
          slug: studios.slug,
          currency: studios.currency
        }
      })
      .from(studioPractitioners)
      .innerJoin(user, eq(studioPractitioners.userId, user.id))
      .innerJoin(studios, eq(studioPractitioners.studioId, studios.id))
      .where(
        and(
          eq(studioPractitioners.id, practitionerId),
          eq(studioPractitioners.isActive, true),
          eq(studioPractitioners.salaryActive, true),
          eq(studioPractitioners.role, userRoles.PRACTITIONER),
          eq(studios.isArchived, false)
        )
      )
      .limit(1)

    if (!practitioner) {
      throwApiError(404, 'Practitioner not found')
    }

    const [avatar, locations, offeringRows] = await Promise.all([
      db
        .select({ url: mediaFiles.url })
        .from(mediaFiles)
        .where(
          and(
            eq(mediaFiles.entityId, practitioner.userId),
            eq(mediaFiles.entityType, MediaEntityTypeEnum.USER),
            eq(mediaFiles.type, MediaTypeEnum.AVATAR)
          )
        )
        .orderBy(mediaFiles.createdAt)
        .limit(1),
      db
        .select({
          id: studioLocations.id,
          name: studioLocations.name,
          city: studioLocations.city,
          country: studioLocations.country,
          address: studioLocations.address,
          timezone: studioLocations.timezone
        })
        .from(studioLocations)
        .where(eq(studioLocations.studioId, practitioner.studio.id)),
      db
        .select({
          id: offerings.id,
          name: offerings.name,
          slug: offerings.slug,
          description: offerings.description,
          activityType: offerings.activityType,
          duration: offerings.duration,
          capacity: offerings.capacity,
          locationId: offerings.locationId,
          timezone: offerings.timezone,
          location: {
            name: studioLocations.name,
            city: studioLocations.city,
            country: studioLocations.country,
            address: studioLocations.address
          },
          minPrice: sql<number>`(
            SELECT COALESCE(MIN(po.price), 0)
            FROM pricing_options po
            WHERE (po.offering_id = ${offerings.id} OR po.studio_id = ${studios.id} AND po.offering_id IS NULL)
            AND po.is_active = true
          )`
        })
        .from(offeringPractitioners)
        .innerJoin(
          offerings,
          eq(offeringPractitioners.offeringId, offerings.id)
        )
        .innerJoin(studios, eq(offerings.studioId, studios.id))
        .leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
        .where(
          and(
            eq(offeringPractitioners.practitionerId, practitioner.id),
            eq(offerings.isPublished, true)
          )
        )
    ])

    const offeringIds = offeringRows.map(offering => offering.id)
    const [offeringMedia, studioLogo] = await Promise.all([
      offeringIds.length
        ? db
            .select({ entityId: mediaFiles.entityId, url: mediaFiles.url })
            .from(mediaFiles)
            .where(
              and(
                inArray(mediaFiles.entityId, offeringIds),
                eq(mediaFiles.entityType, MediaEntityTypeEnum.OFFERING),
                eq(mediaFiles.type, MediaTypeEnum.GALLERY)
              )
            )
            .orderBy(mediaFiles.order)
        : [],
      db
        .select({ url: mediaFiles.url })
        .from(mediaFiles)
        .where(
          and(
            eq(mediaFiles.entityId, practitioner.studio.id),
            eq(mediaFiles.entityType, MediaEntityTypeEnum.STUDIO),
            eq(mediaFiles.type, MediaTypeEnum.LOGO)
          )
        )
        .limit(1)
    ])

    return {
      success: true,
      practitioner: {
        ...practitioner,
        avatar: avatar[0]?.url || practitioner.image || null,
        locations,
        offerings: offeringRows.map(offering => ({
          ...offering,
          gallery: offeringMedia
            .filter(media => media.entityId === offering.id)
            .map(media => media.url),
          studio: {
            ...practitioner.studio,
            logo: studioLogo[0]?.url || null
          },
          isOnline: offering.locationId === null,
          spotsTotal: offering.capacity,
          currency: practitioner.studio.currency
        }))
      }
    }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch practitioner', error)
    throwApiError(500, 'Failed to fetch practitioner')
  }
})
