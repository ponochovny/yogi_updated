import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'postgresql',
	schema: [
		'./server/utils/db/schema/studio.ts',
		'./server/utils/db/schema/auth-schema.ts',
		'./server/utils/db/schema/offering.ts',
		'./server/utils/db/schema/_other.ts',
	],
	out: './server/utils/db/migrations',
	dbCredentials: {
		url: import.meta.env.DATABASE_URL!,
	},
})
