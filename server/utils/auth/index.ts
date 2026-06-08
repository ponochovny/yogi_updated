import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { useDb } from '../db'
import { userRoles } from './config'
import { customSession } from 'better-auth/plugins'
import { and, eq } from 'drizzle-orm'

export const auth = betterAuth({
	database: drizzleAdapter(useDb(), {
		provider: 'pg',
	}),
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		useSecureCookies: process.env.NODE_ENV === 'production',
	},
	user: {
		additionalFields: {
			bio: {
				type: 'string',
				required: false,
			},
			role: {
				type: 'string[]',
				defaultValue() {
					return [userRoles.USER]
				},
				required: false,
				input: false,
			},
		},
	},
	plugins: [
		customSession(async ({ user, session }) => {
			const db = useDb()

			const [avatarFile] = await db
				.select({ url: mediaFiles.url })
				.from(mediaFiles)
				.where(
					and(
						eq(mediaFiles.entityId, user.id),
						eq(mediaFiles.entityType, 'USER'),
						eq(mediaFiles.type, 'AVATAR'),
					),
				)
				.limit(1)

			if (avatarFile) {
				user.image = avatarFile.url
			}

			return {
				...session,
				user: {
					...user,
				},
			}
		}),
	],
})
