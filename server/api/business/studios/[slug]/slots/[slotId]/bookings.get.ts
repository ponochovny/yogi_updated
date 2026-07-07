import { bookings } from '~~/server/db/schema/booking'
import { offeringSlots, pricingOptions } from '~~/server/db/schema/offering'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq, sql } from 'drizzle-orm'
import { userRoles } from '~~/server/auth/config'
import { MediaEntityTypeEnum, MediaTypeEnum } from '~~/server/db/schema/_other'
import { transactions, userPasses } from '~~/server/db/schema/payment'

const userImg = sql`(
    SELECT url
    FROM media_files
    WHERE entity_id = ${user.id}::text
      AND entity_type = ${MediaEntityTypeEnum.USER}
      AND type = ${MediaTypeEnum.AVATAR}
    ORDER BY created_at DESC
    LIMIT 1
  ) user_img`

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)

  const slug = requireRouteParam(event, 'slug')
  const slotId = requireRouteParam(event, 'slotId')

  const db = useDb()

  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS,
    userRoles.MANAGER,
    userRoles.PRACTITIONER
  ])

  const [slot] = await db
    .select({ practitionerId: offeringSlots.practitionerId })
    .from(offeringSlots)
    .where(eq(offeringSlots.id, slotId))
    .limit(1)

  if (!slot) throw createError({ statusCode: 404, message: 'Slot not found' })

  // Trainer Level Safety: If a PRACTITIONER enters, this slot must be HIS slot
  if (
    access.roles.length === 1 &&
    access.roles.includes(userRoles.PRACTITIONER) &&
    slot.practitionerId !== access.practitionerId
  ) {
    throwApiError(
      403,
      'Forbidden: You can only view bookings for your own classes'
    )
  }

  const conditions = []

  const generalConditions = eq(bookings.slotId, slotId)
  const practitionerConditions = and(
    eq(bookings.slotId, slotId),
    eq(offeringSlots.practitionerId, access.practitionerId || '')
  )

  if (
    access.roles.length === 1 &&
    access.roles.includes(userRoles.PRACTITIONER)
  ) {
    conditions.push(practitionerConditions)
  } else {
    conditions.push(generalConditions)
  }

  // Fetch bookings for the slot, including user details
  const slotBookings = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      createdAt: bookings.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: sql<string>`user_img.url`
      },
      transaction: {
        provider: transactions.provider,
        status: transactions.status
      },
      userPass: {
        name: pricingOptions.name,
        type: pricingOptions.type
      }
    })
    .from(bookings)
    .innerJoin(user, eq(bookings.userId, user.id))
    .leftJoinLateral(userImg, sql`TRUE`)
    .leftJoin(transactions, eq(bookings.transactionId, transactions.id))

    .leftJoin(userPasses, eq(bookings.userPassId, userPasses.id))
    .leftJoin(pricingOptions, eq(userPasses.pricingOptionId, pricingOptions.id))

    .innerJoin(offeringSlots, eq(bookings.slotId, offeringSlots.id))
    .where(and(...conditions))

  return slotBookings
})
