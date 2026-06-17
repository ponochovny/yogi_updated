import {
	studios,
	studioPractitioners,
	studioMembers,
} from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq, not, sql } from 'drizzle-orm'
import { addPractitionerSchema } from '@/entities/practitioner/schema'
import { v4 as uuidv4 } from 'uuid'
import { userRoles } from '~~/server/auth/config'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	const body = await readValidatedBody(event, addPractitionerSchema.parse)

	const isNewPractitioner = body.role === userRoles.PRACTITIONER
	const isNewManager = body.role === userRoles.MANAGER

	const [studio] = await db
		.select()
		.from(studios)
		.where(and(eq(studios.slug, slug), eq(studios.ownerId, currentUserId)))
		.limit(1)

	if (!studio) {
		throwApiError(
			404,
			'Studio not found or you do not have permission to add practitioners',
		)
	}

	try {
		let isNewUser: boolean = false

		const result = await db.transaction(async (tx) => {
			// 2. Searching for the user by email in the global table
			let [targetUser] = await tx
				.select()
				.from(user)
				.where(eq(user.email, body.email))
				.limit(1)

			// 3. IF the user does not exist, create a new one with a random password and the "practitioner" role
			if (!targetUser) {
				isNewUser = true
				;[targetUser] = await tx
					.insert(user)
					.values({
						id: uuidv4(), // Identifier for Better Auth
						email: body.email,
						name: body.name,
						emailVerified: false, // Important flag: the user has not yet confirmed their email
						bio: body.bio || '',
						role: [userRoles.PRACTITIONER],
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning()
			}

			if (!targetUser) {
				throwApiError(500, 'Failed to create or find the user')
			}

			// 4. Linking the user to the studio; map DB unique conflict to 409
			if (isNewPractitioner) {
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

				await tx.insert(studioMembers).values({
					studioId: studio.id,
					userId: targetUser.id,
					role: body.role,
				})

				await tx
					.update(user)
					.set({
						role: sql`array_append(COALESCE(${user.role}, '{}'), ${body.role})`,
					})
					.where(
						and(
							eq(user.id, targetUser.id),
							not(sql`${body.role} = ANY(COALESCE(${user.role}, '{}'))`),
						),
					)

				return { member: newPractitioner, user: targetUser }
			} else if (isNewManager) {
				const [newMember] = await tx
					.insert(studioMembers)
					.values({
						studioId: studio.id,
						userId: targetUser.id,
						role: body.role,
					})
					.returning()

				await tx
					.update(user)
					.set({
						role: sql`array_append(COALESCE(${user.role}, '{}'), ${body.role})`,
					})
					.where(
						and(
							eq(user.id, targetUser.id),
							not(sql`${body.role} = ANY(COALESCE(${user.role}, '{}'))`),
						),
					)

				return { member: newMember, user: targetUser }
			}
		})

		// SENDING AN INVITATION EMAIL TO SET THE PASSWORD OF THEIR NEW ACCOUNT
		if (isNewUser) {
			try {
				await auth.api.requestPasswordReset({
					body: {
						email: body.email,
						redirectTo:
							'/reset-password?flow=invite&studioName=' +
							encodeURIComponent(studio?.name || ''), // Pass studio name and invite flow for email context
					},
				})
			} catch (error) {
				console.error('Failed to request password reset for new practitioner', {
					studioSlug: slug,
					error:
						error instanceof Error
							? { name: error.name, message: error.message }
							: { message: 'Unknown error' },
				})
				// TODO: Queue retry or alert for manual follow-up
			}
		}

		return { success: true, data: result }
	} catch (error: unknown) {
		if (isApiError(error)) throw error
		console.error('Failed to add practitioner', error)
		throwApiError(500, 'Failed to add practitioner')
	}
})
