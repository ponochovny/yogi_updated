import {
  pricingOptions,
  offeringSlots,
  offerings
} from '~~/server/db/schema/offering'
import { userPasses } from '~~/server/db/schema/payment'
import { eq, and, or, isNull, gte, sql, inArray } from 'drizzle-orm'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slotId = requireRouteParam(event, 'slotId')
  const db = useDb()

  if (!slotId) {
    throw createError({ statusCode: 400, message: 'Missing slotId parameter' })
  }

  // 1. Fetch slot with its offering details to know the category
  const [slot] = await db
    .select({
      id: offeringSlots.id,
      offeringId: offeringSlots.offeringId,
      categories: offerings.categories,
      studioId: offerings.studioId
    })
    .from(offeringSlots)
    .innerJoin(offerings, eq(offeringSlots.offeringId, offerings.id))
    .where(eq(offeringSlots.id, slotId))
    .limit(1)

  if (!slot) {
    throw createError({ statusCode: 404, message: 'Slot not found' })
  }

  // 2. Fetch all applicable Drop-in tickets for this specific offering
  const dropInTickets = await db
    .select({
      name: pricingOptions.name,
      description: pricingOptions.description,
      price: pricingOptions.price,
      id: pricingOptions.id
    })
    .from(pricingOptions)
    .where(
      and(
        eq(pricingOptions.offeringId, slot.offeringId),
        eq(pricingOptions.type, 'DROP_IN'),
        eq(pricingOptions.isActive, true)
      )
    )

  // 3. If user is logged in, look for their active and valid memberships/passes
  const availableUserPasses = []
  const rawPasses = await db
    .select()
    .from(userPasses)
    .where(
      and(
        eq(userPasses.userId, userData.id),
        eq(userPasses.studioId, slot.studioId),
        eq(userPasses.status, 'ACTIVE'),
        or(
          isNull(userPasses.validUntil),
          gte(userPasses.validUntil, new Date())
        ),
        // remainingCredits must be greater than 0, or NULL (which stands for unlimited memberships)
        or(
          sql`${userPasses.remainingCredits} > 0`,
          isNull(userPasses.remainingCredits)
        )
      )
    )
  // 4. Fetch pricing option details for all passes in one query
  const pricingRows = rawPasses.length
    ? await db
        .select()
        .from(pricingOptions)
        .where(
          inArray(
            pricingOptions.id,
            rawPasses.map(p => p.pricingOptionId)
          )
        )
    : []
  const pricingById = new Map(pricingRows.map(p => [p.id, p]))

  for (const pass of rawPasses) {
    const pricing = pricingById.get(pass.pricingOptionId)
    if (!pricing) continue

    // Filter passes: must apply to all categories (null array) OR include current offering's category
    const isApplicable =
      !pricing.applicableCategoryIds ||
      pricing.applicableCategoryIds.length === 0 ||
      (slot.categories &&
        pricing.applicableCategoryIds &&
        slot.categories.some(category =>
          pricing.applicableCategoryIds?.includes(category)
        ))

    if (isApplicable) {
      availableUserPasses.push({
        id: pass.id,
        name: pricing.name,
        remainingCredits: pass.remainingCredits, // null for unlimited
        validUntil: pass.validUntil
      })
    }
  }

  return {
    success: true,
    options: {
      dropInTickets: dropInTickets.map(ticket => ({
        ...ticket,
        price: ticket.price / 100 // Convert cents to dollars
      })),
      userPasses: availableUserPasses
    }
  }
})
