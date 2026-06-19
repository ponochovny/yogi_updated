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

	const membership = await db
		.select({ role: studioMembers.role, studioId: studios.id })
		.from(studioMembers)
		.innerJoin(studios, eq(studioMembers.studioId, studios.id))
		.where(and(eq(studioMembers.userId, userId), eq(studios.slug, slug)))

	const memberRoles = membership.map((member) => member.role)
	const hasAccess = memberRoles.some((role) => allowedRoles.includes(role))

	if (!membership.length || !hasAccess) {
		throw createError({ statusCode: 403, message: 'Forbidden' })
	}

	let practitionerId: string | null = null
	if (memberRoles.includes(userRoles.PRACTITIONER)) {
		const [practitioner] = await db
			.select({ id: studioPractitioners.id })
			.from(studioPractitioners)
			.where(
				and(
					eq(studioPractitioners.userId, userId),
					eq(studioPractitioners.studioId, membership[0]?.studioId || ''),
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
		roles: memberRoles,
		studioId: membership[0]?.studioId || '',
		practitionerId,
	}
}
