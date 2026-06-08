import { useDb } from '~~/server/utils/db'
import { user } from '~~/server/db/schema/auth-schema'
import { updateProfileSchema } from '~/entities/profile/schema'
import { eq } from 'drizzle-orm'
import {
	mediaFiles,
	MediaEntityTypeEnum,
	MediaTypeEnum,
} from '~~/server/db/schema/_other'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({
		headers: event.headers,
	})

	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Unauthorized access',
		})
	}
	const currentUserId = session.user.id

	const body = await readValidatedBody(event, updateProfileSchema.parse)
	const db = useDb()

	try {
		const result = await db.transaction(async (tx) => {
			const [updatedUser] = await db
				.update(user)
				.set({
					name: body.name,
					bio: body.bio,
					updatedAt: new Date(),
				})
				.where(eq(user.id, currentUserId))
				.returning({
					id: user.id,
					name: user.name,
					bio: user.bio,
				})

			if (updatedUser) {
				if (body.avatar) {
					await tx.insert(mediaFiles).values({
						url: body.avatar.url,
						providerPublicId: body.avatar.providerPublicId,
						entityId: updatedUser.id,
						entityType: MediaEntityTypeEnum.USER,
						type: MediaTypeEnum.AVATAR,
					})
				}
			}

			return updatedUser
		})

		return {
			success: true,
			message: 'Profile updated successfully',
			user: result,
		}
	} catch (error: unknown) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Error updating profile',
			data: (error as Error).message,
		})
	}
})
