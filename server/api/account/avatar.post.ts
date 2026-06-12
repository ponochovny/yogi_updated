import {
	MediaEntityTypeEnum,
	mediaFiles,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'
import { and, eq } from 'drizzle-orm'
import { updateAvatarSchema } from '~/entities/profile/schema'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({ headers: event.headers })
	if (!session || !session.user)
		throw createError({ statusCode: 401, message: 'Not authorized' })

	const userId = session.user.id
	const body = await readValidatedBody(event, updateAvatarSchema.parse)
	const db = useDb()

	if (!body.url)
		throw createError({ statusCode: 400, message: 'Avatar URL is required' })

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
		if (error && typeof error === 'object' && 'statusCode' in error) {
			throw error
		}
		throw createError({
			statusCode: 500,
			statusMessage: 'Failed to update avatar',
		})
	}
})
