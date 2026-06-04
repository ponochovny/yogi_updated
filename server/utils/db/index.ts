import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '~/../server/utils/db/schema'
import * as authSchema from '~/../server/utils/db/auth-schema'
import ws from 'ws'

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

neonConfig.webSocketConstructor = ws

export function useDb() {
	if (!dbInstance) {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL })

		dbInstance = drizzle(pool, { schema: { ...schema, ...authSchema } })
	}
	return dbInstance
}
