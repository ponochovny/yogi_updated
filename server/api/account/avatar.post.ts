import { mediaFiles } from '~~/server/utils/db/schema/_other'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({ headers: event.headers })
	if (!session)
		throw createError({ statusCode: 401, message: 'Not authorized' })

	const userId = session.user.id
	const body: { url: string; providerPublicId: string } = await readBody(event)
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
		throw createError({ statusCode: 500, message: (error as Error).message })
	}
})
