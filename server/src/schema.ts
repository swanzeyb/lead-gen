import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core'

export const domFacebook = sqliteTable('dom:facebook', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['index', 'post'] }),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }),
  html: blob('html', { mode: 'buffer' }),
})

export const facebookCatalog = sqliteTable('facebook:catalog', {
  url: text('url'),
  fbID: text('fbID').unique(),
  first_price: integer('first_price'),
  last_price: integer('last_price'),
  first_seen: integer('first_seen', { mode: 'timestamp_ms' }),
  last_seen: integer('last_seen', { mode: 'timestamp_ms' }),
  title: text('title'),
  location: text('location'),
  miles: integer('miles'),
  id: text('id').primaryKey(),
  status: text('status', { enum: ['pending', 'complete', 'error'] }),
})

export const facebookProduct = sqliteTable('facebook:product', {
  fbID: text('fbID').unique(),
  title: text('title'),
  year: integer('year'),
  make: text('make'),
  model: text('model'),
  doors: integer('doors'),
  class: text('class'),
  price: integer('price'),
  location: text('location'),
  miles: integer('miles'),
  transmission: text('transmission', {
    enum: ['Automatic', 'Manual', 'Other'],
  }),
  exteriorColor: text('exteriorColor'),
  interiorColor: text('interiorColor'),
  fuel: text('fuel'),
  isCleanTitle: integer('isCleanTitle', { mode: 'boolean' }),
  description: text('description'),
  sellerName: text('sellerName'),
  sellerJoined: integer('sellerJoined'),
  id: text('id').primaryKey(),
  updated_at: integer('updated_at', { mode: 'timestamp_ms' }),
})
