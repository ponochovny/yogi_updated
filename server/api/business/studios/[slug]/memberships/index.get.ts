import { eq } from 'drizzle-orm'
import { pricingOptions } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'

export default defineEventHandler(async (event) => {
	const slug = requireRouteParam(event, 'slug')
	const db = useDb()

	// Check if studio exists
	// Check if user is owner or manager of the studio

	try {
		const [studio] = await db
			.select()
			.from(studios)
			.where(eq(studios.slug, slug))
			.limit(1)
		if (!studio) {
			throwApiError(404, 'Studio not found')
		}

		const memberships = await db
			.select()
			.from(pricingOptions)
			.where(eq(pricingOptions.studioId, studio.id))

		return { success: true, memberships }
	} catch (error: unknown) {
		if (isApiError(error)) throw error
		console.error('Failed to create membership', error)
		throwApiError(500, 'Failed to create membership')
	}
})
