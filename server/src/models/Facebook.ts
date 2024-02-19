import { db } from '../db'
import { domFacebook } from '../schema'
import { eq, desc } from 'drizzle-orm'
import { Observable } from 'rxjs'

function observeIndex(htmlString: string) {
  return new Observable((subscriber) => {
    const indexRewriter = new HTMLRewriter()
      .on('a[href*="/marketplace/item/"]', {
        element: (element) => subscriber.next(element),
      })
      .onDocument({
        end: () => subscriber.complete(),
      })

    indexRewriter.transform(htmlString)
  })
}

export default class Facebook {
  static async parseIndex(htmlString: string) {
    const observer = observeIndex(htmlString)

    observer.subscribe({
      next(x) {
        console.log('got value ' + x)
      },
      error(err) {
        console.error('something wrong occurred: ' + err)
      },
      complete() {
        console.log('done')
      },
    })
  }

  static async addIndex(htmlString: string) {
    const id = crypto.randomUUID()

    // Prepare contents
    // const escaped = Bun.escapeHTML(htmlString)
    const zipped = Bun.gzipSync(htmlString)
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

// Notes

// const postResult = await fetch(
//   'https://api.airtable.com/v0/appci2SPrSoo1fQyC/tbl0BAuVD74IQ0Tjh',
//   {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${AIRTABLE_TOKEN}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       fields: {
//         Timestamp: new Date().toISOString(),
//         Content: result,
//       },
//     }),
//   }
// )

// https://www.facebook.com/marketplace/category/vehicles?sortBy=creation_time_descend&exact=true
