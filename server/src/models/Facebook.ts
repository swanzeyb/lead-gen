import { db } from '../db'
import { domFacebook } from '../schema'

export default class Facebook {
  static async addIndex(htmlString: string) {
    const id = crypto.randomUUID()

    try {
      // Prepare contents
      const escaped = Bun.escapeHTML(htmlString)
      const zipped = Bun.gzipSync(escaped)
      const buffer = Buffer.from(zipped)

      // Write to DB
      db.insert(domFacebook).values([
        {
          id,
          type: 'index',
          timestamp: new Date(),
          html: buffer,
        },
      ])
    } catch (error) {
      console.error(error)
    }

    return id
  }
}
