import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { studios } from '~~/server/db/schema/studio'
import { userRoles } from '~~/server/auth/config'

const settingsSchema = z.object({
  bio: z.string().min(1),
  mission: z.string().min(1),
  cancellationPolicy: z.string().nullable(),
  liabilityWaiver: z.string().nullable()
})

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const body = await readValidatedBody(event, settingsSchema.parse)
  const db = useDb()
  const [current] = await db
    .select({
      waiver: studios.liabilityWaiver,
      version: studios.liabilityWaiverVersion
    })
    .from(studios)
    .where(eq(studios.id, access.studioId))
    .limit(1)
  const waiverChanged = (current?.waiver || null) !== body.liabilityWaiver
  const [updated] = await db
    .update(studios)
    .set({
      ...body,
      liabilityWaiverVersion: waiverChanged
        ? (current?.version || 1) + 1
        : current?.version || 1,
      updatedAt: new Date()
    })
    .where(eq(studios.id, access.studioId))
    .returning()
  return { success: true, studio: updated }
})
