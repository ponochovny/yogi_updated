import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq, sql } from 'drizzle-orm'
import { offeringPractitioners, offerings } from '~~/server/db/schema/offering'
import { MediaEntityTypeEnum, MediaTypeEnum } from '~~/server/db/schema/_other'

export default defineEventHandler(async event => {
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
      and(eq(offerings.slug, offeringSlug), eq(offerings.studioId, studio.id))
    )
    .limit(1)
  if (!offering) {
    throwApiError(404, 'Offering not found')
  }

  const practitionerImg = sql`(
				SELECT url
				FROM media_files
				WHERE entity_id = ${user.id}::text
					AND entity_type = ${MediaEntityTypeEnum.USER}
					AND type = ${MediaTypeEnum.AVATAR}
				ORDER BY created_at DESC
				LIMIT 1
			) practitioner_img`

  try {
    const practitioners = await db
      .select({
        id: offeringPractitioners.id,
        practitionerId: studioPractitioners.id,
        name: user.name,
        email: user.email,
        avatar: sql<string>`practitioner_img.url`
      })
      .from(offeringPractitioners)
      .innerJoin(
        studioPractitioners,
        eq(offeringPractitioners.practitionerId, studioPractitioners.id)
      )
      .innerJoin(user, eq(studioPractitioners.userId, user.id))
      .leftJoinLateral(practitionerImg, sql`TRUE`)
      .where(eq(offeringPractitioners.offeringId, offering.id))

    return {
      success: true,
      practitioners
    }
  } catch (error: unknown) {
    if (isApiError(error)) throw error
    console.error('Failed to fetch offering practitioners', error)
    throwApiError(500, 'Failed to fetch offering practitioners')
  }
})
