export interface BasicCarListing {
  URL: string
  fbID: string
  price: number
  title: string
  location: string
  miles: number
}

interface BasicCarListingUnsettled {
  URL?: string
  fbID?: string
  price?: string
  title?: string
  location?: string
  miles?: string
}

class CatalogDetailSM {
  private currentState:
    | 'Start'
    | 'Price'
    | 'Title'
    | 'Location'
    | 'Miles'
    | 'URL'
  private currentData: BasicCarListingUnsettled

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

export default class FBCatalogParser {
  static extractDetails(html: string): Promise<BasicCarListing[]> {
    return new Promise((resolve) => {
      const detailSM = new CatalogDetailSM()
      const findings: BasicCarListing[] = []

      const indexRewriter = new HTMLRewriter()
        .on('a[href*="/marketplace/item/"]', {
          element: (element) => {
            /*
              On the start of a new item, reset the state machine to clear any previous data
            */
            if (detailSM.getState() !== 'Start') {
              detailSM.reset()
            }

            detailSM.input(
              `https://facebook.com${element.getAttribute('href')}`
            )
          },
          text: ({ text }) => {
            if (text) {
              detailSM.input(text)

              // Check if we've received all details
              if (detailSM.isAccepted()) {
                findings.push(detailSM.getData() as unknown as BasicCarListing)
                detailSM.reset()
              }
            }
          },
        })
        .onDocument({
          end: () => resolve(findings),
        })

      indexRewriter.transform(html)
    })
  }

  // static parseDetails(): BasicCarListing[] {}
}
