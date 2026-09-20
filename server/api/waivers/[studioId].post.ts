import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { studios } from '~~/server/db/schema/studio'
import { studioWaiverConsents } from '~~/server/db/schema/waiver'

const consentSchema = z.object({ version: z.number().int().positive() })

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const studioId = requireRouteParam(event, 'studioId')
  const body = await readValidatedBody(event, consentSchema.parse)
  const db = useDb()
  const [studio] = await db
    .select({
      waiver: studios.liabilityWaiver,
      version: studios.liabilityWaiverVersion
    })
    .from(studios)
    .where(eq(studios.id, studioId))
    .limit(1)

  if (!studio)
    throw createError({ statusCode: 404, message: 'Studio not found' })
  if (!studio.waiver) return { success: true }
  if (body.version !== studio.version) {
    throw createError({
      statusCode: 409,
      message: 'This waiver has been updated. Please review it again.'
    })
  }

  await db
    .insert(studioWaiverConsents)
    .values({
      id: randomUUID(),
      studioId,
      userId: userData.id,
      waiverVersion: studio.version,
      ipAddress: getRequestIP(event, { xForwardedFor: true }) || null
    })
    .onConflictDoNothing()

  return { success: true }
})
