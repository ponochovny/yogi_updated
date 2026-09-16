import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { offeringSlots } from '~~/server/db/schema/offering'
import { offerings } from '~~/server/db/schema/offering'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { userRoles } from '~~/server/auth/config'

const slotSchema = z.object({
  offeringId: z.uuid(),
  practitionerId: z.uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  capacityOverride: z.number().int().positive().nullable().optional()
})

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const slotId = requireRouteParam(event, 'slotId')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS,
    userRoles.MANAGER
  ])
  const body = await readValidatedBody(event, slotSchema.parse)
  const db = useDb()
  const [ownedOffering] = await db
    .select({ id: offerings.id })
    .from(offerings)
    .where(
      and(
        eq(offerings.id, body.offeringId),
        eq(offerings.studioId, access.studioId)
      )
    )
    .limit(1)
  const [ownedPractitioner] = await db
    .select({ id: studioPractitioners.id })
    .from(studioPractitioners)
    .where(
      and(
        eq(studioPractitioners.id, body.practitionerId),
        eq(studioPractitioners.studioId, access.studioId)
      )
    )
    .limit(1)
  if (!ownedOffering || !ownedPractitioner)
    throwApiError(400, 'Slot references are outside this studio')
  const [updated] = await db
    .update(offeringSlots)
    .set(body)
    .where(
      and(
        eq(offeringSlots.id, slotId),
        eq(offeringSlots.offeringId, body.offeringId)
      )
    )
    .returning()
  if (!updated) throwApiError(404, 'Slot not found')
  return { success: true, slot: updated }
})
