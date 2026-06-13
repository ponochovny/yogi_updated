import { studios, studioPractitioners } from '~~/server/db/schema/studio'
import { user } from '~~/server/db/schema/auth-schema'
import { and, eq } from 'drizzle-orm'
import { addPractitionerSchema } from '@/entities/practitioner/schema'
import { v4 as uuidv4 } from 'uuid'
import { practitionerRoles } from '~~/server/auth/config'

export default defineEventHandler(async (event) => {
	const userData = await requireAuthenticatedUser(event)
	const slug = requireRouteParam(event, 'slug')
	const currentUserId = userData.id
	const db = useDb()

	const body = await readValidatedBody(event, addPractitionerSchema.parse)
	let studio: { id: string; name: string } | undefined

	try {
		const result = await db.transaction(async (tx) => {
			// 1. Checking if the studio exists and belongs to the current user (owner)
			;[studio] = await tx
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
						role: [practitionerRoles.PRACTITIONER],
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning()
			}

			if (!targetUser) {
				throwApiError(500, 'Failed to create or find the user')
			}

			// 4. Linking the user to the studio; map DB unique conflict to 409
			let newPractitioner
			try {
				;[newPractitioner] = await tx
					.insert(studioPractitioners)
					.values({
						studioId: studio.id,
						userId: targetUser.id,
						role: body.role,
						salaryActive: body.salaryActive,
						isActive: true,
					})
					.returning()
			} catch (e) {
				if ((e as { code?: string }).code === '23505') {
					throwApiError(409, 'Practitioner is already added to this studio')
				}
				throw e
			}

			return { practitionerLink: newPractitioner, user: targetUser }
		})

		// 6. Construct the setup URL
		// In production, you would trigger an email send here via Resend/Postmark
		// const setupLink = `https://yourdomain.com/auth/setup-password?token=${tokenResponse.token}`

		// TODO: In the background, send an email notification to targetUser.email
		// "You have been added to studio X. Click the link to set your password."

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

		return { success: true, data: result }
	} catch (error: unknown) {
		if (isApiError(error)) throw error
		throwApiError(500, 'Failed to fetch offering', {
			detail: getErrorMessage(error),
		})
	}
})
