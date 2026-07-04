import { userRoles } from '~~/server/auth/config'
import { pricingOptions } from '~~/server/db/schema/offering'

export default defineEventHandler(async event => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const slug = requireRouteParam(event, 'slug')
  const { name, description, type, price, credits, durationDays } =
    await readBody(event)

  const { studioId } = await checkStudioAccess(session.user.id, slug, [
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
