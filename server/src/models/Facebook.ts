import { Observable } from 'rxjs'
import { db } from '../db'
import { domFacebook } from '../schema'
import { eq, desc } from 'drizzle-orm'

class IndexDetailSM {
  private currentState:
    | 'Start'
    | 'Price'
    | 'Title'
    | 'Location'
    | 'Miles'
    | 'URL'
  private currentData: {
    URL?: string
    price?: string
    title?: string
    location?: string
    miles?: string
  }

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
  }
}

function observeIndex(htmlString: string) {
  return new Observable((subscriber) => {
    const detailSM = new IndexDetailSM()

    const indexRewriter = new HTMLRewriter()
      .on('a[href*="/marketplace/item/"]', {
        element: (element) => {
          /*
            Some car posts don't have mile data
            If the last state isn't start, and we get a new link
            Reset the state machine because we're on a new post
            And discard the other data we digested
          */
          if (detailSM.getState() !== 'Start') {
            detailSM.reset()
          }

          detailSM.input(`https://facebook.com${element.getAttribute('href')}`)
        },
        text: ({ text }) => {
          if (text) detailSM.input(text)

          // Check if we've received all details
          if (detailSM.isAccepted()) {
            subscriber.next(detailSM.getData())
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
  static parseIndex(htmlString: string) {
    const indexObserver = observeIndex(htmlString)

    indexObserver.subscribe({
      next(x) {
        console.log('got value ', x)
      },
      error(err) {
        console.error('something wrong occurred: ', err)
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
