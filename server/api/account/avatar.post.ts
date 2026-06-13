import {
	MediaEntityTypeEnum,
	mediaFiles,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'
import { and, eq } from 'drizzle-orm'
import { updateAvatarSchema } from '~/entities/profile/schema'

export default defineEventHandler(async (event) => {
	const user = await requireAuthenticatedUser(event)
	const userId = user.id
	const body = await readValidatedBody(event, updateAvatarSchema.parse)
	const db = useDb()

	if (!body.url) throwApiError(400, 'Avatar URL is required')

	try {
		await db.transaction(async (tx) => {
			await tx
				.delete(mediaFiles)
				.where(
					and(
						eq(mediaFiles.entityId, userId),
						eq(mediaFiles.entityType, MediaEntityTypeEnum.USER),
						eq(mediaFiles.type, MediaTypeEnum.AVATAR),
					),
				)

			await tx.insert(mediaFiles).values({
				url: body.url,
				providerPublicId: body.providerPublicId,
				entityId: userId,
				entityType: MediaEntityTypeEnum.USER,
				type: MediaTypeEnum.AVATAR,
			})
		})

		return { success: true, url: body.url }
	} catch (error) {
		if (isApiError(error)) throw error
		console.error('Failed to update avatar', error)
		throwApiError(500, 'Failed to update avatar')
	}
})
