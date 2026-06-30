import { pricingOptions } from '~~/server/db/schema/offering'
import { studios } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'
import { createMembershipSchema } from '~/entities/membership/schema'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	const body = await readValidatedBody(event, createMembershipSchema.parse)

	// Check if studio exists and the user is it's owner
	const [studio] = await db
		.select({ id: studios.id })
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)
	if (!studio) {
		throwApiError(404, "Studio is not found or you don't have permissions")
	}

	try {
		const result = await db.transaction(async (tx) => {
			const [newMembership] = await tx
				.insert(pricingOptions)
				.values({
					studioId: studio.id,
					offeringId: null,
					applicableCategoryIds: body.applicableCategoryIds,
					name: body.name,
					description: body.description,
					type: body.type,
					price: body.price * 100,
					credits: !body.credits ? null : body.credits,
					durationDays: body.durationDays,
					isActive: body.isActive,
				})
				.returning()

			if (!newMembership) throwApiError(500, 'Failed to create membership')

			return newMembership
		})

		return { success: true, membership: result }
	} catch (error: unknown) {
		if (isApiError(error)) throw error
		console.error('Failed to create membership', error)
		throwApiError(500, 'Failed to create membership')
	}
})
