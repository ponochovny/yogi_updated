import { and, eq, ilike, or } from 'drizzle-orm'
import { user } from '~~/server/db/schema/auth-schema'
import { studios } from '~~/server/db/schema/studio'
import { userRoles } from '~~/server/auth/config'
import { transactions } from '~~/server/db/schema/payment'

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
    .innerJoin(transactions, eq(transactions.userId, user.id))
    .where(
      and(
        eq(transactions.studioId, access.studioId),
        or(
          ilike(user.email, `%${search}%`),
          ilike(user.name, `%${search}%`),
          ilike(user.phone, `%${search}%`)
        )
      )
    )
    .groupBy(user.id, user.name, user.email, user.phone)
    .limit(10)
  void access
  return rows
})
