import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core'

export const domFacebook = sqliteTable('dom:facebook', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['index', 'post'] }),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }),
  html: blob('html', { mode: 'buffer' }),
})
