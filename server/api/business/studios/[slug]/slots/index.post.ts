import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { offeringSlots, offerings } from '~~/server/db/schema/offering'
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
  .refine(slot => slot.endTime > slot.startTime, {
    message: 'endTime must be later than startTime',
    path: ['endTime']
  })

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS,
    userRoles.MANAGER
  ])
  const body = await readValidatedBody(event, slotSchema.parse)
  const db = useDb()
  const [offering] = await db
    .select({ id: offerings.id })
    .from(offerings)
    .where(
      and(
        eq(offerings.id, body.offeringId),
        eq(offerings.studioId, access.studioId)
      )
    )
    .limit(1)
  if (!offering) throwApiError(400, 'Offering does not belong to this studio')
  const [practitioner] = await db
    .select({ id: studioPractitioners.id })
    .from(studioPractitioners)
    .where(
      and(
        eq(studioPractitioners.id, body.practitionerId),
        eq(studioPractitioners.studioId, access.studioId)
      )
    )
    .limit(1)
  if (!practitioner)
    throwApiError(400, 'Practitioner does not belong to this studio')
  const [created] = await db.insert(offeringSlots).values(body).returning()
  return { success: true, slot: created }
})
