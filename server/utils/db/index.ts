import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as _other from '~~/server/db/schema/_other'
import * as authSchema from '~~/server/db/schema/auth-schema'
import * as studio from '~~/server/db/schema/studio'
import * as offering from '~~/server/db/schema/offering'
import * as booking from '~~/server/db/schema/booking'

import ws from 'ws'

const schema = {
	...studio,
	...authSchema,
	...offering,
	...booking,
	..._other,
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

neonConfig.webSocketConstructor = ws

export function useDb() {
	if (!dbInstance) {
		const pool = new Pool({ connectionString: process.env.DATABASE_URL })

		dbInstance = drizzle(pool, { schema })
	}
	return dbInstance
}
