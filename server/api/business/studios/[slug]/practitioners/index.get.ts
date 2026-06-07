import { studios, studioPractitioners } from '~~/server/utils/db/schema/studio'
import { user } from '~~/server/utils/db/schema/auth-schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	// VALIDATING AUTHORIZATION
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

	// Checking if the studio exists and belongs to the current user (owner)
	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)

	if (!studio) throw createError({ statusCode: 404 })

	// Getting all practitioners with their profile data
	const team = await db
		.select({
			linkId: studioPractitioners.id,
			role: studioPractitioners.role,
			isActive: studioPractitioners.isActive,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image, // If there is an avatar
				emailVerified: user.emailVerified, // Useful to display a "Not Verified" badge in the UI
			},
		})
		.from(studioPractitioners)
		.innerJoin(user, eq(studioPractitioners.userId, user.id))
		.where(eq(studioPractitioners.studioId, studio.id))

	return { success: true, team }
})
