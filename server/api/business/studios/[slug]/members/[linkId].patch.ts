import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { studioPractitioners } from '~~/server/db/schema/studio'
import { userRoles } from '~~/server/auth/config'

const compensationSchema = z.object({
  compensationType: z.enum(['FLAT_RATE', 'PER_ATTENDEE', 'REVENUE_SHARE']),
  compensationRate: z.number().int().min(0)
})

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const linkId = requireRouteParam(event, 'linkId')
  const body = await readValidatedBody(event, compensationSchema.parse)
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const [updated] = await useDb()
    .update(studioPractitioners)
    .set(body)
    .where(
      and(
        eq(studioPractitioners.id, linkId),
        eq(studioPractitioners.studioId, access.studioId)
      )
    )
    .returning()
  if (!updated) throwApiError(404, 'Team member not found')
  return { success: true, member: updated }
})
