import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core'

export const domFacebook = sqliteTable('dom:facebook', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['index', 'post'] }),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }),
  html: blob('html', { mode: 'buffer' }),
})

/*
interface DetailExtractionSettled {
  URL: string
  fbID: string
  price: string
  title: string
  location: string
  miles: string
}
*/
export const facebookIndex = sqliteTable('facebook:index', {
  url: text('url'),
  fbID: text('fbID'),
  price: text('price'),
  title: text('title'),
  location: text('location'),
  miles: text('miles'),
  id: text('id').primaryKey(),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }),
  status: text('status', { enum: ['pending', 'complete'] }),
  error: text('error'),
})
