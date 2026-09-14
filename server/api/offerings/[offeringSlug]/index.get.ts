import {
  offerings,
  offeringPractitioners,
  pricingOptions
} from '~~/server/db/schema/offering'
import {
  studioLocations,
  studioPractitioners,
  studios
} from '~~/server/db/schema/studio'
import {
  mediaFiles,
  MediaEntityTypeEnum,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { aliasedTable, and, eq, inArray, sql } from 'drizzle-orm'
import { user } from '~~/server/db/schema/auth-schema'
import { globalCategories, globalTypes } from '~~/server/db/schema/global'

export default defineEventHandler(async event => {
  const offeringSlug = requireRouteParam(event, 'offeringSlug')

  const db = useDb()
  const studioLogo = aliasedTable(mediaFiles, 'studio_logo')

  try {
    // Verify the offering exists and is published
    const [offering] = await db
      .select({
        id: offerings.id,
        slug: offerings.slug,
        name: offerings.name,
        description: offerings.description,
        activityType: offerings.activityType,
        isPrivate: offerings.isPrivate,
        location: {
          name: studioLocations.name,
          country: studioLocations.country,
          city: studioLocations.city,
          address: studioLocations.address
        },
        timezone: offerings.timezone,
        duration: offerings.duration,
        capacity: offerings.capacity,
        studio: {
          logo: studioLogo.url,
          name: studios.name,
          slug: studios.slug,
          id: studios.id,
          currency: studios.currency
        },
        categories: offerings.categories,
        types: offerings.types
      })
      .from(offerings)
      .where(
        and(eq(offerings.slug, offeringSlug), eq(offerings.isPublished, true))
      )
      .leftJoin(studioLocations, eq(offerings.locationId, studioLocations.id))
      .innerJoin(studios, eq(offerings.studioId, studios.id))
      .leftJoin(
        studioLogo,
        and(
          eq(studioLogo.entityId, sql`${studios.id}::text`),
          eq(studioLogo.entityType, MediaEntityTypeEnum.STUDIO),
          eq(studioLogo.type, MediaTypeEnum.LOGO)
        )
      )
      .limit(1)

    if (!offering) {
      throwApiError(404, 'Offering not found')
    }

    // Fetch associated practitioners and gallery media files in parallel
    const [practitionerRows, galleryRows, categoryRows, typeRows, prices] =
      await Promise.all([
        db
          .select({ practitionerId: offeringPractitioners.practitionerId })
          .from(offeringPractitioners)
          .where(eq(offeringPractitioners.offeringId, offering.id)),
        db
          .select({
            url: mediaFiles.url,
            providerPublicId: mediaFiles.providerPublicId
          })
          .from(mediaFiles)
          .where(
            and(
              eq(mediaFiles.entityId, offering.id),
              eq(mediaFiles.entityType, MediaEntityTypeEnum.OFFERING),
              eq(mediaFiles.type, MediaTypeEnum.GALLERY)
            )
          )
          .orderBy(mediaFiles.order),
        db
          .select({ name: globalCategories.name })
          .from(globalCategories)
          .where(
            offering.categories?.length
              ? inArray(globalCategories.id, offering.categories)
              : sql`false`
          )
          .orderBy(globalCategories.name),
        db
          .select({ name: globalTypes.name })
          .from(globalTypes)
          .where(
            offering.types?.length
              ? inArray(globalTypes.id, offering.types)
              : sql`false`
          )
          .orderBy(globalTypes.name),
        db
          .select({
            id: pricingOptions.id,
            name: pricingOptions.name,
            description: pricingOptions.description,
            type: pricingOptions.type,
            price: pricingOptions.price,
            credits: pricingOptions.credits,
            durationDays: pricingOptions.durationDays
          })
          .from(pricingOptions)
          .where(
            and(
              eq(pricingOptions.studioId, offering.studio.id),
              eq(pricingOptions.isActive, true),
              sql`(${pricingOptions.offeringId} = ${offering.id} OR ${pricingOptions.offeringId} IS NULL)`
            )
          )
          .orderBy(pricingOptions.price)
      ])

    const practitionerDetails = await db
      .select({
        id: studioPractitioners.id,
        name: user.name,
        avatar: user.image
      })
      .from(studioPractitioners)
      .innerJoin(user, eq(studioPractitioners.userId, user.id))
      .where(
        and(
          eq(studioPractitioners.studioId, offering.studio.id),
          eq(studioPractitioners.salaryActive, true)
        )
      )

    return {
      success: true,
      offering: {
        ...offering,
        categories: categoryRows.map(row => row.name),
        types: typeRows.map(row => row.name),
        pricingOptions: prices,
        practitioners: practitionerDetails
          .filter(detail =>
            practitionerRows.some(row => row.practitionerId === detail.id)
          )
          .map(detail => {
            return {
              id: detail.id,
              name: detail.name,
              avatar: detail.avatar
            }
          }),
        gallery: galleryRows.map(r => r.url)
      }
    }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch offering', error)
    throwApiError(500, 'Failed to fetch offering')
  }
})
