import { db } from '../db'
import { domFacebook } from '../schema'
import { eq, desc } from 'drizzle-orm'

export default class Facebook {
  static async addIndex(htmlString: string) {
    const id = crypto.randomUUID()

    // Prepare contents
    const escaped = Bun.escapeHTML(htmlString)
    const zipped = Bun.gzipSync(escaped)
    const buffer = Buffer.from(zipped)

    // Write to DB
    await db.insert(domFacebook).values([
      {
        id,
        type: 'index',
        timestamp: new Date(),
        html: buffer,
      },
    ])

    return id
  }

  static async getIndex(id?: string) {
    // Read from DB
    const [index] = await (id
      ? db.select().from(domFacebook).where(eq(domFacebook.id, id)).limit(1)
      : db
          .select()
          .from(domFacebook)
          .orderBy(desc(domFacebook.timestamp))
          .limit(1))

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
}
