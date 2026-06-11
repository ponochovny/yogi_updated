import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq } from 'drizzle-orm'
import { offeringPractitioners, offerings } from '~~/server/db/schema/offering'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({
		headers: event.headers,
	})

	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized access',
		})
	}

	// VALIDATING SLUG PARAMETER
	const slug = getRouterParam(event, 'slug')
	const offeringSlug = getRouterParam(event, 'offeringSlug')
	if (!slug || !offeringSlug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Studio slug and offering slug is required',
		})
	}

	const currentUserId = session.user.id
	const db = useDb()

	// 1. Check if studio exists and the user is it's owner
	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)
	if (!studio) {
		throw createError({
			statusCode: 404,
			statusMessage: "Studio is not found or you don't have permissions",
		})
	}

	const [offering] = await db
		.select()
		.from(offerings)
		.where(and(eq(offerings.slug, offeringSlug)))
		.limit(1)
	if (!offering) {
		throw createError({
			statusCode: 404,
			statusMessage: 'Offering not found',
		})
	}

	// 2. Additional data
	// const offeringPractitionersArray = await db
	// 	.select({
	// 		id: offeringPractitioners.id,
	// 		name: user.name,
	// 		email: user.email,
	// 		avatar: user.image,
	// 	})
	// 	.from(offeringPractitioners)
	// 	.where(and(eq(offeringPractitioners.offeringId, offering.id)))

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
})
