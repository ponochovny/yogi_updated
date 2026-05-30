import { auth } from '../../utils/auth'
import { studio } from '../../utils/db/schema'

export default defineEventHandler(async (event) => {
	const session = await auth.api.getSession({
		headers: event.headers,
	})

	if (!session || !session.user) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Неавторизованный доступ',
		})
	}

	const body = await readBody(event)
	const { name, slug } = body

	if (!name || !slug) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Поля name и slug обязательны для заполнения',
		})
	}

	const db = useDb()

	try {
		const newStudioId = Math.random().toString(36).substring(2, 11)

		await db.insert(studio).values({
			id: newStudioId,
			name,
			slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
			ownerId: session.user.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		})

		return {
			status: 'success',
			message: 'Студия успешно зарегистрирована и привязана к вашему аккаунту',
			studioId: newStudioId,
		}
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('23505')) {
			throw createError({
				statusCode: 409,
				statusMessage: 'Этот slug уже занят другой студией',
			})
		}
		throw createError({
			statusCode: 500,
			statusMessage: `Ошибка БД: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
		})
	}
})
