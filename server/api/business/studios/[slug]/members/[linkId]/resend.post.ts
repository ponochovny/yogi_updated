import { and, eq } from 'drizzle-orm'
import { studioPractitioners, studios } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const linkId = requireRouteParam(event, 'linkId')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const [member] = await useDb()
    .select({ email: user.email, studioName: studios.name })
    .from(studioPractitioners)
    .innerJoin(user, eq(user.id, studioPractitioners.userId))
    .innerJoin(studios, eq(studios.id, studioPractitioners.studioId))
    .where(
      and(
        eq(studioPractitioners.id, linkId),
        eq(studioPractitioners.studioId, access.studioId)
      )
    )
    .limit(1)
  if (!member) throwApiError(404, 'Team member not found')
  await auth.api.requestPasswordReset({
    body: {
      email: member.email,
      redirectTo: `/reset-password?flow=invite&studioName=${encodeURIComponent(member.studioName)}`
    }
  })
  return { success: true }
})
