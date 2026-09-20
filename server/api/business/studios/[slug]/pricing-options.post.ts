import { userRoles } from '~~/server/auth/config'
import { pricingOptions } from '~~/server/db/schema/offering'
import { requireStudioAccess } from '~~/server/utils/api-helpers'

export default defineEventHandler(async event => {
  const slug = requireRouteParam(event, 'slug')
  const { name, description, type, price, credits, durationDays } =
    await readBody(event)

  const { studioId } = await requireStudioAccess(event, slug, [
    userRoles.BUSINESS,
    userRoles.MANAGER
  ])

  const db = useDb()

  const [newOption] = await db
    .insert(pricingOptions)
    .values({
      studioId,
      name,
      description,
      type,
      price: price * 100, // Store in cents
      credits: type === 'MEMBERSHIP' ? null : credits, // Protection from fools
      durationDays,
      isActive: true // By default available for purchase
    })
    .returning()

  return { success: true, data: newOption }
})
