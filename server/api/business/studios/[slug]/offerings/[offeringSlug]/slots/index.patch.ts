import { offerings, offeringSlots } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'
import { updateSlotsSchema } from '~/entities/slots/schema'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const offeringSlug = requireRouteParam(event, 'offeringSlug')
  const currentUserId = userData.id
  const db = useDb()

  // Check if studio exists and the user is it's owner
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
    throwApiError(404, 'Offering not found')
  }

  const body = await readValidatedBody(event, updateSlotsSchema.parse)

  try {
    const [updatedSlot] = await db
      .update(offeringSlots)
      .set({
        status: body.status,
        practitionerId: body.practitionerId,
        capacityOverride: body.capacityOverride
      })
      .where(
        and(
          eq(offeringSlots.offeringId, offering.id),
          eq(offeringSlots.id, body.id)
        )
      )
      .returning({
        id: offeringSlots.id,
        startTime: offeringSlots.startTime,
        endTime: offeringSlots.endTime,
        status: offeringSlots.status,
        practitionerId: offeringSlots.practitionerId,
        capacityOverride: offeringSlots.capacityOverride
      })

    if (!updatedSlot) {
      throwApiError(404, 'Time slot not found')
    }

    return { success: true, updatedSlot }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to update slot', error)
    throwApiError(500, 'Failed to update slot')
  }
})
