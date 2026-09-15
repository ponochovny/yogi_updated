import { desc, eq, sql } from 'drizzle-orm'
import { bookings } from '~~/server/db/schema/booking'
import {
  offerings,
  offeringSlots,
  pricingOptions
} from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import { transactions, userPasses } from '~~/server/db/schema/payment'

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  const db = useDb()

  const transactionRows = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      currency: transactions.currency,
      provider: transactions.provider,
      status: transactions.status,
      createdAt: transactions.createdAt,
      studio: { name: studios.name, slug: studios.slug },
      service: sql<string>`coalesce(${offerings.name}, ${pricingOptions.name}, 'Account credit')`
    })
    .from(transactions)
    .innerJoin(studios, eq(transactions.studioId, studios.id))
    .leftJoin(bookings, eq(bookings.transactionId, transactions.id))
    .leftJoin(offeringSlots, eq(bookings.slotId, offeringSlots.id))
    .leftJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
    .leftJoin(userPasses, eq(userPasses.transactionId, transactions.id))
    .leftJoin(pricingOptions, eq(userPasses.pricingOptionId, pricingOptions.id))
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.createdAt))

  return { success: true, transactions: transactionRows }
})
