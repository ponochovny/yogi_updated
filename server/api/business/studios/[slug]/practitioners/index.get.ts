import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq, sql } from 'drizzle-orm'
import {
	MediaEntityTypeEnum,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'

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
	const practitionerImg = sql`(
		SELECT url
		FROM media_files
		WHERE entity_id = ${user.id}::text
			AND entity_type = ${MediaEntityTypeEnum.USER}
			AND type = ${MediaTypeEnum.AVATAR}
		ORDER BY created_at DESC
		LIMIT 1
	) practitioner_img`

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
				image: sql<string>`practitioner_img.url`,
				emailVerified: user.emailVerified, // Useful to display a "Not Verified" badge in the UI
			},
		})
		.from(studioPractitioners)
		.innerJoin(user, eq(studioPractitioners.userId, user.id))
		.leftJoinLateral(practitionerImg, sql`TRUE`)
		.where(eq(studioPractitioners.studioId, studio.id))

	return { success: true, team }
})
