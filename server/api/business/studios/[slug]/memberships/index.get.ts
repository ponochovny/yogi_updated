import { and, eq, inArray } from 'drizzle-orm'
import { priceOptionsType } from '~/entities/membership/schema'
import { userRoles } from '~~/server/auth/config'
import { globalCategories } from '~~/server/db/schema/global'
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
          inArray(pricingOptions.type, [
            priceOptionsType.MEMBERSHIP,
            priceOptionsType.PACK
          ])
        )
      )

    const categoryIds = memberships.flatMap(m => m.applicableCategoryIds || [])
    const globalCategoriesData = categoryIds.length
      ? await db
          .select()
          .from(globalCategories)
          .where(inArray(globalCategories.id, categoryIds))
      : []

    return {
      success: true,
      memberships: memberships.map(membership => ({
        ...membership,
        applicableCategories: globalCategoriesData
          .filter(cat => membership.applicableCategoryIds?.includes(cat.id))
          .map(cat => cat.name)
      }))
    }
  } catch (error) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch memberships', error)
    throwApiError(500, 'Failed to fetch memberships')
  }
})
