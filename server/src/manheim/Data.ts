import { db } from '../db'
import { domManheim, manheimValues } from '../schema'
import { eq, desc } from 'drizzle-orm'

interface ManheimData {
  low: number
  average: number
  high: number
  adjusted: number
}

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

  static setValuesHTML(htmlString: string) {
    return this.addHTML(htmlString)
  }

  static getValuesHTML({ id, limit }: { id?: string; limit?: number }) {
    return this.getHTML({ id, limit })
  }

  static setValues(data: ManheimData[] | ManheimData) {
    const values = Array.isArray(data) ? data : [data]
    const now = new Date()

    const rows = values.map((item) => ({
      ...item,
      id: crypto.randomUUID(), // Add the id property
      updated_at: now,
    }))

    return db
      .transaction((tx) => {
        return Promise.all(
          rows.map((item) =>
            tx
              .insert(manheimValues)
              .values(item)
              .onConflictDoUpdate({
                target: manheimValues.id,
                set: { updated_at: now }, // todo
              })
              .returning({ id: facebookProduct.id })
          )
        )
      })
      .then((resultIds) => resultIds.flat())
  }
}
