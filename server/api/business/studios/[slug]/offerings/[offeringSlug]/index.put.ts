import { offerings, offeringPractitioners } from '~~/server/db/schema/offering'
import {
  studioLocations,
  studioPractitioners,
  studios
} from '~~/server/db/schema/studio'
import {
  MediaEntityTypeEnum,
  mediaFiles,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { and, eq, inArray } from 'drizzle-orm'
import { createOfferingSchema } from '~/entities/offering/schema'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const offeringSlug = requireRouteParam(event, 'offeringSlug')
  const currentUserId = userData.id
  const db = useDb()

  // Verify the studio exists and belongs to the current user
  const [studio] = await db
    .select()
    .from(studios)
    .where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
    .limit(1)
  if (!studio) {
    throwApiError(
      404,
      'Studio not found or you do not have permission to this offering'
    )
  }

  // Verify the offering exists and belongs to the studio
  const [offering] = await db
    .select()
    .from(offerings)
    .where(
      and(eq(offerings.slug, offeringSlug), eq(offerings.studioId, studio.id))
    )
    .limit(1)
  if (!offering) {
    throwApiError(404, 'Offering not found in this studio')
  }

  const body = await readValidatedBody(event, createOfferingSchema.parse)

  // Validate location belongs to the studio
  if (body.locationId) {
    const [location] = await db
      .select({ id: studioLocations.id })
      .from(studioLocations)
      .where(
        and(
          eq(studioLocations.id, body.locationId),
          eq(studioLocations.studioId, studio.id)
        )
      )
      .limit(1)
    if (!location) {
      throwApiError(400, 'Invalid location for this studio')
    }
  }

  // Validate practitioners belong to the studio
  const validPractitioners = await db
    .select({ id: studioPractitioners.id })
    .from(studioPractitioners)
    .where(
      and(
        eq(studioPractitioners.studioId, studio.id),
        inArray(studioPractitioners.id, body.practitionerIds)
      )
    )
  if (validPractitioners.length !== body.practitionerIds.length) {
    throwApiError(400, 'One or more practitioners are invalid for this studio')
  }

  try {
    const result = await db.transaction(async tx => {
      // Update offering details
      await tx
        .update(offerings)
        .set({
          name: body.name,
          description: body.description,
          activityType: body.activityType,
          isPrivate: body.isPrivate,
          locationId: body.locationId,
          timezone: body.timezone,
          duration: body.duration,
          capacity: body.capacity,
          updatedAt: new Date()
        })
        .where(eq(offerings.id, offering.id))

      // Update offering practitioners
      // TODO: Optimize by diffing existing vs new practitioners to minimize queries and avoid deleting all and re-inserting when there are no changes
      await tx
        .delete(offeringPractitioners)
        .where(eq(offeringPractitioners.offeringId, offering.id))
      if (body.practitionerIds.length > 0) {
        await tx.insert(offeringPractitioners).values(
          body.practitionerIds.map(practitionerId => ({
            offeringId: offering.id,
            practitionerId
          }))
        )
      }

      if (body.gallery !== undefined) {
        // Update offering gallery media
        // TODO: Optimize by diffing existing vs new media to minimize queries and avoid deleting all and re-inserting when there are no changes
        await tx
          .delete(mediaFiles)
          .where(
            and(
              eq(mediaFiles.entityId, offering.id),
              eq(mediaFiles.entityType, MediaEntityTypeEnum.OFFERING),
              eq(mediaFiles.type, MediaTypeEnum.GALLERY)
            )
          )
        if (body.gallery.length > 0) {
          await tx.insert(mediaFiles).values(
            body.gallery.map((image, index) => ({
              url: image.url,
              providerPublicId: image.providerPublicId,
              entityId: offering.id,
              entityType: MediaEntityTypeEnum.OFFERING,
              type: MediaTypeEnum.GALLERY,
              order: index
            }))
          )
        }
      }

      // Fetch the updated offering with associated practitioners and gallery media
      const [updatedOffering] = await tx
        .select({
          id: offerings.id,
          slug: offerings.slug,
          name: offerings.name,
          description: offerings.description,
          activityType: offerings.activityType,
          isPrivate: offerings.isPrivate,
          locationId: offerings.locationId,
          timezone: offerings.timezone,
          duration: offerings.duration,
          capacity: offerings.capacity
        })
        .from(offerings)
        .where(eq(offerings.id, offering.id))
        .limit(1)

      return updatedOffering
    })

    return { success: true, offering: result }
  } catch (error: unknown) {
    if (isApiError(error)) throw error
    console.error('Failed to update offering', error)
    throwApiError(500, 'Failed to update offering')
  }
})
