import { and, eq } from 'drizzle-orm'
import { priceOptionsType } from '~/entities/membership/schema'
import { userRoles } from '~~/server/auth/config'
import { pricingOptions } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const db = useDb()

  try {
    const access = await checkStudioAccess(userData.id, slug, [
      userRoles.BUSINESS,
      userRoles.MANAGER
    ])

    const [studio] = await db
      .select()
      .from(studios)
      .where(eq(studios.id, access.studioId))
      .limit(1)
    if (!studio) {
      throwApiError(404, 'Studio not found')
    }

    const memberships = await db
      .select()
      .from(pricingOptions)
      .where(
        and(
          eq(pricingOptions.studioId, studio.id),
          eq(pricingOptions.type, priceOptionsType.MEMBERSHIP)
        )
      )

    return { success: true, memberships }
  } catch (error: unknown) {
    if (isApiError(error)) throw error
    console.error('Failed to create membership', error)
    throwApiError(500, 'Failed to create membership')
  }
})
