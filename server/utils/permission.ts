import {
	studioMembers,
	studioPractitioners,
	studios,
} from '~~/server/db/schema/studio'
import { eq, and } from 'drizzle-orm'
import { userRoles } from '../auth/config'

export const checkStudioAccess = async (
	userId: string,
	slug: string,
	allowedRoles: string[],
) => {
	const db = useDb()

	const [membership] = await db
		.select({ role: studioMembers.role, studioId: studios.id })
		.from(studioMembers)
		.innerJoin(studios, eq(studioMembers.studioId, studios.id))
		.where(and(eq(studioMembers.userId, userId), eq(studios.slug, slug)))
		.limit(1)

	if (!membership || !allowedRoles.includes(membership.role)) {
		throw createError({ statusCode: 403, message: 'Forbidden' })
	}

	let practitionerId: string | null = null
	if (membership.role === userRoles.PRACTITIONER) {
		const [practitioner] = await db
			.select({ id: studioPractitioners.id })
			.from(studioPractitioners)
			.where(
				and(
					eq(studioPractitioners.userId, userId),
					eq(studioPractitioners.studioId, membership.studioId),
				),
			)
			.limit(1)

		if (!practitioner) {
			throw createError({
				statusCode: 403,
				message: 'Practitioner profile not found',
			})
		}
		practitionerId = practitioner.id
	}

	return {
		role: membership.role,
		studioId: membership.studioId,
		practitionerId,
	}
}
