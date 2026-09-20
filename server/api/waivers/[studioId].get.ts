import { eq, and } from 'drizzle-orm'
import { studios } from '~~/server/db/schema/studio'
import { studioWaiverConsents } from '~~/server/db/schema/waiver'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const studioId = requireRouteParam(event, 'studioId')
  const db = useDb()

  const [studio] = await db
    .select({
      id: studios.id,
      name: studios.name,
      waiver: studios.liabilityWaiver,
      version: studios.liabilityWaiverVersion
    })
    .from(studios)
    .where(eq(studios.id, studioId))
    .limit(1)

  if (!studio)
    throw createError({ statusCode: 404, message: 'Studio not found' })

  const [consent] = await db
    .select({ id: studioWaiverConsents.id })
    .from(studioWaiverConsents)
    .where(
      and(
        eq(studioWaiverConsents.studioId, studioId),
        eq(studioWaiverConsents.userId, userData.id),
        eq(studioWaiverConsents.waiverVersion, studio.version)
      )
    )
    .limit(1)

  return {
    required: Boolean(studio.waiver) && !consent,
    studio: {
      id: studio.id,
      name: studio.name,
      waiver: studio.waiver,
      version: studio.version
    }
  }
})
