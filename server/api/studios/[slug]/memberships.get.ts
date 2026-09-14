import { and, eq, inArray } from 'drizzle-orm'
import { priceOptionsType } from '~/entities/membership/schema'
import { globalCategories } from '~~/server/db/schema/global'
import { pricingOptions } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'

export default defineEventHandler(async event => {
  const slug = requireRouteParam(event, 'slug')
  const db = useDb()

  const [studio] = await db
    .select({ id: studios.id })
    .from(studios)
    .where(eq(studios.slug, slug))
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
        eq(pricingOptions.isActive, true),
        inArray(pricingOptions.type, [
          priceOptionsType.MEMBERSHIP,
          priceOptionsType.PACK
        ])
      )
    )

  const categoryIds = memberships.flatMap(
    membership => membership.applicableCategoryIds || []
  )
  const categories = categoryIds.length
    ? await db
        .select()
        .from(globalCategories)
        .where(inArray(globalCategories.id, categoryIds))
    : []

  return {
    success: true,
    memberships: memberships.map(membership => ({
      ...membership,
      applicableCategories: categories
        .filter(category =>
          membership.applicableCategoryIds?.includes(category.id)
        )
        .map(category => category.name)
    }))
  }
})
