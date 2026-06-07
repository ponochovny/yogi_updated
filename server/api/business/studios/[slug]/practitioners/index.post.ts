import { studios, studioPractitioners } from '~~/server/utils/db/schema/studio'
import { user } from '~~/server/utils/db/schema/auth-schema'
import { and, eq } from 'drizzle-orm'
import { addPractitionerSchema } from '@/entities/practitioner/schema'
import { v4 as uuidv4 } from 'uuid'
import { FetchError } from 'ofetch'

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
	const slug = getRouterParam(event, 'slug')

	const body = await readValidatedBody(event, addPractitionerSchema.parse)

	try {
		const db = useDb()
		const result = await db.transaction(async (tx) => {
			// 1. Checking if the studio exists and belongs to the current user (owner)
			const [studio] = await tx
				.select()
				.from(studios)
				.where(and(eq(studios.slug, slug!), eq(studios.ownerId, currentUserId)))
				.limit(1)

			if (!studio) {
				throw createError({ statusCode: 404, message: 'Studio not found' })
			}

			// 2. Searching for the user by email in the global table
			let [targetUser] = await tx
				.select()
				.from(user)
				.where(eq(user.email, body.email))
				.limit(1)

			// 3. IF the user does not exist, create a new one with a random password and the "practitioner" role
			if (!targetUser) {
				;[targetUser] = await tx
					.insert(user)
					.values({
						id: uuidv4(), // Identifier for Better Auth
						email: body.email,
						name: body.name,
						emailVerified: false, // Important flag: the user has not yet confirmed their email
						bio: body.bio || '',
						role: ['practitioner'],
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning()
			}

			if (!targetUser) {
				throw createError({
					statusCode: 500,
					message: 'Failed to create or find the user',
				})
			}

			// 4. Checking if the user is already linked to the studio as a practitioner (to avoid duplicates) --- IGNORE ---
			const [existingLink] = await tx
				.select()
				.from(studioPractitioners)
				.where(
					and(
						eq(studioPractitioners.studioId, studio.id),
						eq(studioPractitioners.userId, targetUser.id),
					),
				)
				.limit(1)

			if (existingLink) {
				throw createError({
					statusCode: 409,
					message: 'Этот сотрудник уже добавлен в студию',
				})
			}

			// 5. Linking the user to the studio with the specified role and salaryActive status
			const [newPractitioner] = await tx
				.insert(studioPractitioners)
				.values({
					studioId: studio.id,
					userId: targetUser.id,
					role: body.role,
					salaryActive: body.salaryActive,
					isActive: true,
				})
				.returning()

			return { practitionerLink: newPractitioner, user: targetUser }
		})

		// TODO: In the background, send an email notification to targetUser.email
		// "You have been added to studio X. Click the link to set your password."

		return { success: true, data: result }
	} catch (error) {
		if (error instanceof FetchError) {
			throw createError({
				statusCode: error.statusCode || 500,
				message: error.message,
			})
		}
	}
})
