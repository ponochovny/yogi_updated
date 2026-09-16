import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { transactions } from '~~/server/db/schema/payment'
import { studios } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const query = getQuery(event)
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const conditions = [eq(transactions.studioId, access.studioId)]
  if (query.provider)
    conditions.push(eq(transactions.provider, String(query.provider) as never))
  if (query.status)
    conditions.push(eq(transactions.status, String(query.status) as never))
  const customer = String(query.customer || '').trim()
  const rows = await useDb()
    .select({
      id: transactions.id,
      amount: transactions.amount,
      currency: transactions.currency,
      provider: transactions.provider,
      status: transactions.status,
      failureReason: transactions.failureReason,
      providerTransactionId: transactions.providerTransactionId,
      createdAt: transactions.createdAt,
      customer: { id: user.id, name: user.name, email: user.email }
    })
    .from(transactions)
    .innerJoin(user, eq(user.id, transactions.userId))
    .where(
      and(
        ...conditions,
        customer
          ? or(
              ilike(user.name, `%${customer}%`),
              ilike(user.email, `%${customer}%`)
            )
          : undefined
      )
    )
    .orderBy(desc(transactions.createdAt))
  return rows
})
