import { and, desc, eq, gte, isNull, or } from 'drizzle-orm'
import { pricingOptions } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import { userPasses } from '~~/server/db/schema/payment'

export default defineEventHandler(async event => {
  const user = await requireAuthenticatedUser(event)
  const db = useDb()

  const passes = await db
    .select({
      id: userPasses.id,
      status: userPasses.status,
      remainingCredits: userPasses.remainingCredits,
      validFrom: userPasses.validFrom,
      validUntil: userPasses.validUntil,
      name: pricingOptions.name,
      credits: pricingOptions.credits,
      studio: { name: studios.name, slug: studios.slug },
      currency: studios.currency
    })
    .from(userPasses)
    .innerJoin(
      pricingOptions,
      eq(userPasses.pricingOptionId, pricingOptions.id)
    )
    .innerJoin(studios, eq(userPasses.studioId, studios.id))
    .where(
      and(
        eq(userPasses.userId, user.id),
        or(
          isNull(userPasses.validUntil),
          gte(userPasses.validUntil, new Date())
        )
      )
    )
    .orderBy(desc(userPasses.validUntil))

  return { success: true, passes }
})
