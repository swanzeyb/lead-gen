import { db } from '../db'
import { domManheim } from '../schema'
import { eq, desc } from 'drizzle-orm'

export default class MHData {
  private static async addHTML(htmlString: string) {
    const id = crypto.randomUUID()

    // Prepare contents
    // const escaped = Bun.escapeHTML(htmlString) // TODO: Broke HTML Rewriter
    const zipped = Bun.gzipSync(htmlString)
    const buffer = Buffer.from(zipped)

    // Duplicate check
    // Bun.hash.wyhash("data", 1234);

    // Write to DB
    await db.insert(domManheim).values([
      {
        id,
        timestamp: new Date(),
        html: buffer,
      },
    ])

    return id
  }

  private static async getHTML({
    id,
    limit = 1,
  }: {
    id?: string
    limit?: number
  }) {
    // Read from DB
    const [index] = await (id
      ? db.select().from(domManheim).where(eq(domManheim.id, id)).limit(limit)
      : db
          .select()
          .from(domManheim)
          .orderBy(desc(domManheim.timestamp))
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
}
