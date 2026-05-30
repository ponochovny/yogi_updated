import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '~/../server/utils/db/schema'
import * as authSchema from '~/../server/utils/db/auth-schema'

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
	if (!dbInstance) {
		// const config = useRuntimeConfig()

		const sql = neon(process.env.DATABASE_URL!)
		dbInstance = drizzle({ client: sql, schema: { ...schema, ...authSchema } })
	}
	return dbInstance
}
