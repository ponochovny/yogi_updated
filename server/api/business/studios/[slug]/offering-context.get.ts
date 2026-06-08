import {
	studios,
	studioPractitioners,
	studioLocations,
} from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq } from 'drizzle-orm'

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
	if (!slug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Slug is required',
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

	// 2. Additional data
	const [practitioners, locations] = await Promise.all([
		db
			.select({
				id: studioPractitioners.id,
				name: user.name,
				email: user.email,
				avatar: user.image,
			})
			.from(studioPractitioners)
			.innerJoin(user, eq(studioPractitioners.userId, user.id))
			.where(
				and(
					eq(studioPractitioners.studioId, studio.id),
					eq(studioPractitioners.salaryActive, true),
				),
			),

		db
			.select()
			.from(studioLocations)
			.where(eq(studioLocations.studioId, studio.id)),
	])

	return {
		success: true,
		studio: {
			id: studio.id,
			locations,
			practitioners,
		},
	}
})
