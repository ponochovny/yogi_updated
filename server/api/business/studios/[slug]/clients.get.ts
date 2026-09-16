import { and, eq, ilike, or } from 'drizzle-orm'
import { user } from '~~/server/db/schema/auth-schema'
import { studios } from '~~/server/db/schema/studio'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS,
    userRoles.MANAGER
  ])
  const search = String(getQuery(event).search || '').trim()
  if (search.length < 2) return []
  const rows = await useDb()
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    })
    .from(user)
    .where(
      and(
        eq(user.emailVerified, true),
        or(
          ilike(user.email, `%${search}%`),
          ilike(user.name, `%${search}%`),
          ilike(user.phone, `%${search}%`)
        )
      )
    )
    .limit(10)
  void access
  return rows
})
