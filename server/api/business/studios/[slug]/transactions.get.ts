import { and, desc, eq, ilike, or } from 'drizzle-orm'
import {
  transactions,
  TransactionProvider,
  TransactionStatus
} from '~~/server/db/schema/payment'
import { user } from '~~/server/db/schema/auth-schema'
import { userRoles } from '~~/server/auth/config'
import { z } from 'zod'

const transactionsQuerySchema = z.object({
  provider: z
    .enum([
      TransactionProvider.STRIPE,
      TransactionProvider.LIQPAY,
      TransactionProvider.HUTKO,
      TransactionProvider.MONOPAY,
      TransactionProvider.CASH,
      TransactionProvider.FREE
    ])
    .optional(),
  status: z
    .enum([
      TransactionStatus.PENDING,
      TransactionStatus.SUCCESS,
      TransactionStatus.FAILED,
      TransactionStatus.REFUNDED
    ])
    .optional(),
  customer: z.string().trim().optional()
})

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const query = await getValidatedQuery(event, transactionsQuerySchema.parse)
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const conditions = [eq(transactions.studioId, access.studioId)]
  if (query.provider) conditions.push(eq(transactions.provider, query.provider))
  if (query.status) conditions.push(eq(transactions.status, query.status))
  const customer = query.customer || ''
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
