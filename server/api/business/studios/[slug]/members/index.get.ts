import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq, sql } from 'drizzle-orm'
import { MediaEntityTypeEnum, MediaTypeEnum } from '~~/server/db/schema/_other'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	const memberImg = sql`(
		SELECT url
		FROM media_files
		WHERE entity_id = ${user.id}::text
			AND entity_type = ${MediaEntityTypeEnum.USER}
			AND type = ${MediaTypeEnum.AVATAR}
		ORDER BY created_at DESC
		LIMIT 1
	) member_img`

	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)
	if (!studio) {
		throwApiError(
			404,
			'Studio not found or you do not have permission to view it',
		)
	}

	try {
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
					image: sql<string>`member_img.url`,
					emailVerified: user.emailVerified, // Useful to display a "Not Verified" badge in the UI
				},
			})
			.from(studioPractitioners)
			.innerJoin(user, eq(studioPractitioners.userId, user.id))
			.leftJoinLateral(memberImg, sql`TRUE`)
			.where(eq(studioPractitioners.studioId, studio.id))

		return { success: true, team }
	} catch (error: unknown) {
		if (isApiError(error)) throw error
		console.error('Failed to fetch practitioners', error)
		throwApiError(500, 'Failed to fetch practitioners')
	}
})
