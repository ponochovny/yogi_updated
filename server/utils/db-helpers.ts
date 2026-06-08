import { type AnyColumn, sql } from 'drizzle-orm'
import type { MediaTypeEnum } from './db/schema/_other'

export function getEntityGallery(
	entityIdColumn: AnyColumn,
	entityType: string,
	mediaType: (typeof MediaTypeEnum)[keyof typeof MediaTypeEnum],
) {
	return sql<string[]>`(
    SELECT COALESCE(json_agg(url ORDER BY "order" ASC), '[]'::json)
    FROM media_files
    WHERE media_files.entity_id = ${entityIdColumn}
    AND media_files.entity_type = ${entityType}
    AND media_files.type = ${mediaType}
  )`
}
