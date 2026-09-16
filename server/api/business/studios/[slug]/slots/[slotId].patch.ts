import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { offerings, offeringSlots } from '~~/server/db/schema/offering'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { userRoles } from '~~/server/auth/config'

const slotSchema = z
  .object({
    offeringId: z.uuid(),
    practitionerId: z.uuid(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    capacityOverride: z.number().int().positive().nullable().optional()
  })
  .refine(data => data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime']
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
  const [ownedSlot] = await db
    .select({ id: offeringSlots.id })
    .from(offeringSlots)
    .innerJoin(offerings, eq(offerings.id, offeringSlots.offeringId))
    .where(
      and(eq(offeringSlots.id, slotId), eq(offerings.studioId, access.studioId))
    )
  if (!ownedSlot)
    throw createError({ statusCode: 404, message: 'Slot not found' })
  const [updated] = await db
    .update(offeringSlots)
    .set(body)
    .where(eq(offeringSlots.id, slotId))
    .returning()
  if (!updated) throwApiError(404, 'Slot not found')
  return { success: true, slot: updated }
})
