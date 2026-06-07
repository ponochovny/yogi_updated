import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { useDb } from '../db'
import { userRoles } from './config'

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
})
