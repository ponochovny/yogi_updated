import { studios } from '~~/server/db/schema/studio'
import { and, eq } from 'drizzle-orm'
import {
  mediaFiles,
  MediaEntityTypeEnum,
  MediaTypeEnum
} from '~~/server/db/schema/_other'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async event => {
  const userData = await requireAuthenticatedUser(event)
  const slug = requireRouteParam(event, 'slug')
  const access = await checkStudioAccess(userData.id, slug, [
    userRoles.BUSINESS
  ])
  const [studio] = await useDb()
    .select()
    .from(studios)
    .where(eq(studios.id, access.studioId))
    .limit(1)
  if (!studio) throwApiError(404, 'Studio not found')
  const media = await useDb()
    .select({
      url: mediaFiles.url,
      type: mediaFiles.type,
      order: mediaFiles.order
    })
    .from(mediaFiles)
    .where(
      and(
        eq(mediaFiles.entityId, studio.id),
        eq(mediaFiles.entityType, MediaEntityTypeEnum.STUDIO)
      )
    )
    .orderBy(mediaFiles.order)
  return {
    ...studio,
    logo: media.find(file => file.type === MediaTypeEnum.LOGO)?.url || null,
    gallery: media
      .filter(file => file.type === MediaTypeEnum.GALLERY)
      .map(file => file.url)
  }
})
