import { and, eq } from 'drizzle-orm'
import { pricingOptions } from '~~/server/db/schema/offering'
import { userRoles } from '~~/server/auth/config'
import { createMembershipSchema } from '~/entities/membership/schema'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const membershipId = requireRouteParam(event, 'membershipId')
  const body = await readValidatedBody(event, createMembershipSchema.parse)
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS,
    userRoles.MANAGER
  ])

  const [updated] = await useDb()
    .update(pricingOptions)
    .set({
      name: body.name,
      description: body.description,
      type: body.type,
      price: body.price * 100,
      credits: body.type === 'MEMBERSHIP' ? null : body.credits,
      durationDays: body.durationDays,
      expiryRule: body.expiryRule,
      expiryBufferDays: body.expiryBufferDays,
      maxBookingsPerDay: body.maxBookingsPerDay,
      applicableCategoryIds: body.applicableCategoryIds,
      isActive: body.isActive
    })
    .where(
      and(
        eq(pricingOptions.id, membershipId),
        eq(pricingOptions.studioId, access.studioId)
      )
    )
    .returning()

  if (!updated)
    throw createError({ statusCode: 404, message: 'Pricing option not found' })
  return { success: true, membership: updated }
})
