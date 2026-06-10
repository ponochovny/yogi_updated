import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'postgresql',
	schema: [
		'./server/db/schema/studio.ts',
		'./server/db/schema/auth-schema.ts',
		'./server/db/schema/offering.ts',
		'./server/db/schema/_other.ts',
	],
	out: './server/utils/db/migrations',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
})
