import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	dialect: 'postgresql',
	schema: ['./server/utils/db/schema.ts', './server/utils/db/auth-schema.ts'],
	out: './server/utils/db/migrations',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
})
