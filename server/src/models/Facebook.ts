import { db } from '../db'
import { domFacebook, facebookIndex } from '../schema'
import { eq, and, desc } from 'drizzle-orm'
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

interface PostExtraction {
  title?: string
  price?: string
  location?: string
  miles?: string
  transmission?: string
  exteriorColor?: string
  interiorColor?: string
  fuel?: string
  titleBrand?: string
  description?: string
  sellerName?: string
  sellerJoined?: string
  isSponsored?: boolean
}

export class PostSM {
  private currentState:
    | 'Start'
    | 'Title'
    | 'Price'
    | 'Location'
    | 'Miles'
    | 'Transmission'
    | 'Exterior Color'
    | 'Interior Color'
    | 'Fuel'
    | 'Title Brand'
    | 'Description Next'
    | 'Description'
    | 'Seller Name Next'
    | 'Seller Name'
    | 'Seller Joined'
    | 'Is Sponsored'
  private currentData: any

  constructor() {
    this.currentState = 'Start'
    this.currentData = {}
  }

  input(str: string) {
    switch (this.currentState) {
      case 'Start':
        if (/^\d{4} \w+ \w+.*/.test(str)) {
          this.currentState = 'Title'
          this.currentData.title = str
        }
        break
      case 'Title':
        if (str.includes('$')) {
          this.currentState = 'Price'
          this.currentData.price = str
        }
        break
      case 'Price':
        if (/^[^,]+, [A-Z]{2}$/.test(str)) {
          this.currentState = 'Location'
          this.currentData.location = str
        }
        break
      case 'Location':
        if (str.includes('mile')) {
          this.currentState = 'Miles'
          this.currentData.miles = str
        }
        break
      case 'Miles':
        if (str.includes('transmission')) {
          this.currentState = 'Transmission'
          this.currentData.transmission = str
        }
        break
      case 'Transmission':
        if (str.includes('Exterior')) {
          this.currentState = 'Exterior Color'
          this.currentData.exteriorColor = str
        }
        break
      case 'Exterior Color':
        if (str.includes('Interior')) {
          this.currentState = 'Interior Color'
          this.currentData.interiorColor = str
        }
        break
      case 'Interior Color':
        if (str.includes('Fuel')) {
          this.currentState = 'Fuel'
        }
        break
      case 'Fuel':
        this.currentState = 'Title Brand'
        this.currentData.fuel = str
        break
      case 'Title Brand':
        if (str.includes('title')) {
          this.currentState = 'Description Next'
          this.currentData.titleBrand = str
        }
        break
      case 'Description Next':
        if (str.includes('Description')) {
          this.currentState = 'Description'
        }
        break
      case 'Description':
        this.currentState = 'Seller Name Next'
        this.currentData.description = str
        break
      case 'Seller Name Next':
        if (str.includes('Seller details')) {
          this.currentState = 'Seller Name'
        }
        break
      case 'Seller Name':
        this.currentState = 'Seller Joined'
        this.currentData.sellerName = str
        break
      case 'Seller Joined':
        if (/^\d{4}$/.test(str)) {
          this.currentState = 'Is Sponsored'
          this.currentData.sellerJoined = str
        }
        break
      case 'Is Sponsored':
        this.currentData.isSponsored ??= false
        if (str.includes('Sponsored')) {
          this.currentData.isSponsored = true
        }
        break
    }
  }

  isAccepted() {
    return this.currentState === 'Is Sponsored'
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

function observePost(htmlString: string) {
  return new Observable((subscriber) => {
    const indexRewriter = new HTMLRewriter()
      .on('div[role="main"]', {
        text: ({ text }) => {
          subscriber.next(text)
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

  private static async getHTML(type: 'index' | 'post', id?: string) {
    // Read from DB
    const [index] = await (id
      ? db
          .select()
          .from(domFacebook)
          .where(and(eq(domFacebook.id, id), eq(domFacebook.type, type)))
          .limit(1)
      : db
          .select()
          .from(domFacebook)
          .orderBy(desc(domFacebook.timestamp))
          .where(eq(domFacebook.type, type))
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
    return Facebook.getHTML('index', id)
  }

  static async addPost(htmlString: string) {
    return Facebook.addHTML(htmlString, 'post')
  }

  static async getPost(id?: string) {
    return Facebook.getHTML('post', id)
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
