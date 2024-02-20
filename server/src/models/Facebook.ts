import { db } from '../db'
import { domFacebook, facebookIndex } from '../schema'
import { eq, desc } from 'drizzle-orm'
import { Observable, lastValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

interface DetailExtraction {
  URL?: string
  fbID?: string
  price?: string
  title?: string
  location?: string
  miles?: string
}

class IndexDetailSM {
  private currentState:
    | 'Start'
    | 'Price'
    | 'Title'
    | 'Location'
    | 'Miles'
    | 'URL'
  private currentData: DetailExtraction

  constructor() {
    this.currentState = 'Start'
    this.currentData = {}
  }

  input(str: string) {
    switch (this.currentState) {
      case 'Start':
        if (str.includes('http')) {
          this.currentState = 'URL'
          this.currentData.URL = str

          // Extract item ID
          this.currentData.fbID = str.match(/\/item\/(\d+)\//)?.[1]
        }
        break
      case 'URL':
        if (str.includes('$')) {
          this.currentState = 'Price'
          this.currentData.price = str
        }
        break
      case 'Price':
        this.currentState = 'Title' // Moves to Title on next input
        this.currentData.title = str
        break
      case 'Title':
        this.currentState = 'Location' // Moves to Location on next input
        this.currentData.location = str
        break
      case 'Location':
        if (str.includes('mile')) {
          this.currentState = 'Miles' // Accepts when input includes 'mile'
          this.currentData.miles = str
        }
        break
    }
  }

  isAccepted() {
    return this.currentState === 'Miles'
  }

  getState() {
    return this.currentState
  }

  getData() {
    return this.currentData
  }

  reset() {
    this.currentState = 'Start'
    this.currentData = {}
  }
}

interface DetailExtractionSettled {
  URL: string
  fbID: string
  price: string
  title: string
  location: string
  miles: string
}

function observeIndex(htmlString: string): Observable<DetailExtractionSettled> {
  return new Observable((subscriber) => {
    const detailSM = new IndexDetailSM()

    const indexRewriter = new HTMLRewriter()
      .on('a[href*="/marketplace/item/"]', {
        element: (element) => {
          /*
            On the start of a new item, reset the state machine to clear any previous data
          */
          if (detailSM.getState() !== 'Start') {
            detailSM.reset()
          }

          detailSM.input(`https://facebook.com${element.getAttribute('href')}`)
        },
        text: ({ text }) => {
          if (text) {
            detailSM.input(text)

            // Check if we've received all details
            if (detailSM.isAccepted()) {
              subscriber.next(detailSM.getData() as DetailExtractionSettled)
              detailSM.reset()
            }
          }
        },
      })
      .onDocument({
        end: () => subscriber.complete(),
      })

    indexRewriter.transform(htmlString)
  })
}

export default class Facebook {
  static setDetail(index: DetailExtractionSettled[]) {
    const now = new Date()

    const items = index.map((item) => ({
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
              .insert(facebookIndex)
              .values(item)
              .onConflictDoUpdate({
                target: facebookIndex.fbID,
                set: { last_seen: now, last_price: item.price },
              })
              .returning({ id: facebookIndex.id })
          )
        )
      })
      .then((resultIds) => resultIds.flat())
  }

  static getDetail({ limit = 1, fbId }: { limit?: number; fbId?: string }) {
    return db
      .select()
      .from(facebookIndex)
      .orderBy(desc(facebookIndex.last_seen))
      .limit(limit)
      .where(fbId ? eq(facebookIndex.fbID, fbId) : undefined)
  }

  static updateDetail({
    fbId,
    status,
    last_seen,
  }: {
    fbId: string
    status: 'complete' | 'error'
    last_seen: Date
  }) {
    return db
      .update(facebookIndex)
      .set({ status, last_seen })
      .where(eq(facebookIndex.fbID, fbId))
  }

  static parseIndex(htmlString: string) {
    const indexObserver = observeIndex(htmlString)

    // Reduce to array and return promise
    return lastValueFrom(indexObserver.pipe(toArray()))
  }

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

  private static async getHTML(id?: string) {
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

  static async addIndex(htmlString: string) {
    return Facebook.addHTML(htmlString, 'index')
  }

  static async getIndex(id?: string) {
    return Facebook.getHTML(id)
  }

  static async addPost(htmlString: string) {
    return Facebook.addHTML(htmlString, 'post')
  }

  static async getPost(id?: string) {
    return Facebook.getHTML(id)
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
