import type { BasicCarListing } from './CatalogParser'
import type { DetailedCarListing } from './ProductParser'
import { db } from '../db'
import { domFacebook, facebookCatalog, facebookProduct } from '../schema'
import { eq, and, desc } from 'drizzle-orm'

type DBInsertCatalog = typeof facebookCatalog.$inferInsert
type FBInsertCatalog = Omit<DBInsertCatalog, 'id'> & BasicCarListing

type DBInsertProduct = typeof facebookProduct.$inferInsert
type FBInsertProduct = Omit<DBInsertProduct, 'id'> & DetailedCarListing

export default class FBData {
  private static async addHTML(htmlString: string, type: 'index' | 'post') {
    const id = crypto.randomUUID()

    // Prepare contents
    // const escaped = Bun.escapeHTML(htmlString) // TODO: Broke HTML Rewriter
    const zipped = Bun.gzipSync(htmlString)
    const buffer = Buffer.from(zipped)

    // Duplicate check
    // Bun.hash.wyhash("data", 1234);

    // Write to DB
    await db.insert(domFacebook).values([
      {
        id,
        type,
        timestamp: new Date(),
        html: buffer,
      },
    ])

    return id
  }

  private static async getHTML({
    type,
    id,
    limit = 1,
  }: {
    type: 'index' | 'post'
    id?: string
    limit?: number
  }) {
    // Read from DB
    const [index] = await (id
      ? db
          .select()
          .from(domFacebook)
          .where(and(eq(domFacebook.id, id), eq(domFacebook.type, type)))
          .limit(limit)
      : db
          .select()
          .from(domFacebook)
          .orderBy(desc(domFacebook.timestamp))
          .where(eq(domFacebook.type, type))
          .limit(limit))

    // Unpack contents
    if (index) {
      const unzipped = Bun.gunzipSync(index.html!)
      const text = new TextDecoder().decode(unzipped)

      return {
        ...index,
        html: text,
      }
    }

    return index
  }

  static async getProduct({
    id,
    limit = 1,
  }: { id?: string; limit?: number } = {}) {
    return db
      .select()
      .from(facebookProduct)
      .orderBy(desc(facebookProduct.updated_at))
      .limit(limit)
      .where(id ? eq(facebookProduct.id, id) : undefined)
  }

  static async setProduct(products: FBInsertProduct | FBInsertProduct[]) {
    const index = Array.of(products).flat()
    const now = new Date()

    const items: (FBInsertProduct & { id: string })[] = index.map((item) => ({
      ...item,
      id: crypto.randomUUID(), // Add the id property
      updated_at: now,
    }))

    return db
      .transaction((tx) => {
        return Promise.all(
          items.map((item) =>
            tx
              .insert(facebookProduct)
              .values(item)
              .onConflictDoUpdate({
                target: facebookProduct.fbID,
                set: { updated_at: now }, // YOU LEFT OFF HERE ASSHOLE
              })
              .returning({ id: facebookProduct.id })
          )
        )
      })
      .then((resultIds) => resultIds.flat())
  }

  static async getProductHTML({
    id,
    limit = 1,
  }: {
    id?: string
    limit?: number
  } = {}) {
    return this.getHTML({ type: 'post', id, limit })
  }

  static async setProductHTML(html: string) {
    return this.addHTML(html, 'post')
  }

  static async getCatalog({
    id,
    limit = 1,
  }: { id?: string; limit?: number } = {}) {
    return db
      .select()
      .from(facebookCatalog)
      .orderBy(desc(facebookCatalog.last_seen))
      .limit(limit)
      .where(id ? eq(facebookCatalog.id, id) : undefined)
  }

  static async setCatalog(listings: FBInsertCatalog | FBInsertCatalog[]) {
    const index = Array.of(listings).flat()
    const now = new Date()

    const items: FBInsertCatalog[] = index.map((item) => ({
      ...item,
      url: item.URL,
      first_price: item.price,
      last_price: item.price,
      first_seen: now,
      last_seen: now,
      id: crypto.randomUUID(), // Add the id property
      status: 'pending' as const,
    }))

    return db
      .transaction((tx) => {
        return Promise.all(
          items.map((item) =>
            tx
              .insert(facebookCatalog)
              .values(item)
              .onConflictDoUpdate({
                target: facebookCatalog.fbID,
                set: { last_seen: now, last_price: item.price },
              })
              .returning({ id: facebookCatalog.id })
          )
        )
      })
      .then((resultIds) => resultIds.flat())
  }

  static async getCatalogHTML({
    id,
    limit = 1,
  }: {
    id?: string
    limit?: number
  } = {}) {
    return this.getHTML({ type: 'index', id, limit })
  }

  static async setCatalogHTML(html: string) {
    return this.addHTML(html, 'index')
  }
}
