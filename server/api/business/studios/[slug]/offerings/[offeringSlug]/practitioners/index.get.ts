import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq } from 'drizzle-orm'
import { offeringPractitioners, offerings } from '~~/server/db/schema/offering'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const offeringSlug = requireRouteParam(event, 'offeringSlug')
	const db = useDb()
	const currentUserId = userData.id

	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)
	if (!studio) {
		throwApiError(404, "Studio is not found or you don't have permissions")
	}

	const [offering] = await db
		.select()
		.from(offerings)
		.where(
			and(eq(offerings.slug, offeringSlug), eq(offerings.studioId, studio.id)),
		)
		.limit(1)
	if (!offering) {
		throwApiError(404, 'Offering not found')
	}

	try {
		const practitioners = await db
			.select({
				id: offeringPractitioners.id,
				practitionerId: studioPractitioners.id,
				name: user.name,
				email: user.email,
				avatar: user.image,
			})
			.from(offeringPractitioners)
			.innerJoin(
				studioPractitioners,
				eq(offeringPractitioners.practitionerId, studioPractitioners.id),
			)
			.innerJoin(user, eq(studioPractitioners.userId, user.id))
			.where(eq(offeringPractitioners.offeringId, offering.id))

		return {
			success: true,
			practitioners,
		}
	} catch (error: unknown) {
		if (isApiError(error)) throw error
		throwApiError(500, 'Failed to fetch offering', {
			detail: getErrorMessage(error),
		})
	}
})
