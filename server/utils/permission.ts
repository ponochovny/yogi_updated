import {
  studioMembers,
  studioPractitioners,
  studios
} from '~~/server/db/schema/studio'
import { eq, and } from 'drizzle-orm'
import { userRoles } from '../auth/config'

export const checkStudioAccess = async (
  userId: string,
  slug: string,
  allowedRoles: string[]
) => {
  const db = useDb()

  const membership = await db
    .select({ role: studioMembers.role, studioId: studios.id })
    .from(studioMembers)
    .innerJoin(studios, eq(studioMembers.studioId, studios.id))
    .where(and(eq(studioMembers.userId, userId), eq(studios.slug, slug)))

  const memberRoles = membership.map(member => member.role)
  const grantedRoles = memberRoles.filter(role => allowedRoles.includes(role))
  const hasAccess = grantedRoles.length > 0

  if (!membership.length || !hasAccess) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  let practitionerId: string | null = null
  const hasNonPractitionerAccess = grantedRoles.some(
    role => role !== userRoles.PRACTITIONER
  )
  if (
    grantedRoles.includes(userRoles.PRACTITIONER) &&
    !hasNonPractitionerAccess
  ) {
    const studioId = membership[0]!.studioId
    const [practitioner] = await db
      .select({ id: studioPractitioners.id })
      .from(studioPractitioners)
      .where(
        and(
          eq(studioPractitioners.userId, userId),
          eq(studioPractitioners.studioId, studioId)
        )
      )
      .limit(1)

    if (!practitioner) {
      throw createError({
        statusCode: 403,
        message: 'Practitioner profile not found'
      })
    }
    practitionerId = practitioner.id
  }

  return {
    roles: memberRoles,
    studioId: membership[0]?.studioId || '',
    practitionerId
  }
}
