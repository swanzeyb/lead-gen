import FBTitleParser from './TitleParser'
import { titleCase } from 'title-case'

interface DetailedCarListingUnsettled {
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
}

interface DetailedCarListingUnparsed {
  title: string
  price: string
  location: string
  miles: string
  transmission: string
  exteriorColor: string
  interiorColor: string
  fuel?: string
  titleBrand?: string
  description: string
  sellerName: string
  sellerJoined: string
}

export class ProductDetailSM {
  private currentState:
    | 'Start'
    | 'Title'
    | 'Price'
    | 'Location'
    | 'Miles'
    | 'Transmission'
    | 'Exterior Color'
    | 'Interior Color'
    | 'Next:Description'
    | 'Next:Seller'
    | 'Next:Seller Name'
    | 'Seller Joined'
    | 'Finished'
    | 'Next:Fuel Type'
  private currentData: DetailedCarListingUnsettled

  constructor() {
    this.currentState = 'Start'
    this.currentData = {}
  }

  input(str: string) {
    console.log(this.currentState, '|', str)
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
        if (/^[^,]+, [a-z]{2}$/.test(str)) {
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
        if (str.includes('exterior') && str.includes('interior')) {
          // Some are on the same line.
          const colorParts = str.split(' ')
          const middle = Math.floor(colorParts.length / 2)

          // Now mock the two lines
          this.currentData.exteriorColor = colorParts.slice(0, middle).join(' ')
          this.currentData.interiorColor = colorParts.slice(middle).join(' ')

          this.currentState = 'Interior Color'
        } else if (str.includes('exterior')) {
          this.currentState = 'Exterior Color'
          this.currentData.exteriorColor = str
        }
        break
      case 'Exterior Color':
        if (str.includes('interior')) {
          this.currentState = 'Interior Color'
          this.currentData.interiorColor = str
        }
        break
      case 'Interior Color':
        // From here, there are optional fields that may or may not be present
        // so we need to check for them.
        if (str.includes('fuel')) {
          if (str.length <= 'fuel type:'.length) {
            this.currentState = 'Next:Fuel Type'
          } else {
            this.currentData.fuel = str
          }
        } else if (str.includes('title')) {
          this.currentData.titleBrand = str
        } else if (str.includes('description')) {
          this.currentState = 'Next:Description'
        }
        break
      case 'Next:Fuel Type':
        this.currentData.fuel = str
        this.currentState = 'Interior Color'
        break
      case 'Next:Description':
        // Description can be multi-line, so we need to check for it.
        if (str.includes('see more') || str === this.currentData.location!) {
          this.currentState = 'Next:Seller'
        } else {
          this.currentData.description ??= ''

          // Append to description
          this.currentData.description =
            this.currentData.description.at(-1) === ' '
              ? this.currentData.description + str
              : this.currentData.description + ' ' + str
        }
        break
      case 'Next:Seller':
        if (str.includes('seller details')) {
          this.currentState = 'Next:Seller Name'
        }
        break
      case 'Next:Seller Name':
        this.currentState = 'Seller Joined'
        this.currentData.sellerName = str
        break
      case 'Seller Joined':
        if (/^\d{4}$/.test(str)) {
          this.currentData.sellerJoined = str
          this.currentState = 'Finished'
        }
    }
  }

  isAccepted() {
    return this.currentState === 'Finished'
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

import type { TitleData } from './TitleParser'
export interface DetailedCarListing extends TitleData {
  title: string
  price: number
  location: string
  miles: number
  transmission: 'Automatic' | 'Manual' | 'Other'
  exteriorColor: string
  interiorColor: string
  fuel?: string
  isCleanTitle: boolean
  description: string
  sellerName: string
  sellerJoined: number
}

export default class FBProductParser {
  static extractDetails(html: string): Promise<DetailedCarListingUnparsed> {
    return new Promise((resolve, reject) => {
      const sm = new ProductDetailSM()

      const indexRewriter = new HTMLRewriter()
        .on('div[role="main"]', {
          text: ({ text }) => {
            const str = text
              .trim()
              .replace('\n', '')
              .replace(/[^\x00-\x7F]/g, '')
              .toLowerCase()
            if (str) {
              sm.input(str)
            }
          },
        })
        .onDocument({
          end: () => {
            if (sm.isAccepted()) {
              resolve(sm.getData() as DetailedCarListingUnparsed)
            } else {
              reject(
                new Error('Failed to parse product details', {
                  cause: {
                    currentState: sm.getState(),
                    currentData: sm.getData(),
                  },
                })
              )
            }
          },
        })

      indexRewriter.transform(html)
    })
  }

  static async parseDetails(
    details: DetailedCarListingUnparsed
  ): Promise<DetailedCarListing> {
    const title = await FBTitleParser.parseTitle(details.title)
    const parsed: DetailedCarListing = {
      ...title,
      ...details,
      description: details.description.trim(),
      price: parseInt(details.price.replace(/\D/g, '')),
      miles: parseInt(details.miles.replace(/\D/g, '')),
      transmission: details.transmission.includes('automatic')
        ? 'Automatic'
        : details.transmission.includes('manual')
        ? 'Manual'
        : 'Other',
      isCleanTitle: details.titleBrand
        ? details.titleBrand.includes('clean')
        : details.description.includes('salvage') ||
          details.description.includes('rebuilt') ||
          details.description.includes('totaled')
        ? false
        : true,
      sellerJoined: parseInt(details.sellerJoined.replace(/\D/g, '')),
      exteriorColor: details.exteriorColor.split(' ').at(-1)!,
      interiorColor: details.interiorColor.split(' ').at(-1)!,
    }

    if (parsed.exteriorColor.includes('color')) {
      parsed.exteriorColor = 'other'
    }
    if (parsed.interiorColor.includes('color')) {
      parsed.interiorColor = 'other'
    }

    // To title case
    for (const [key, value] of Object.entries(parsed)) {
      if (key === 'description') continue
      if (typeof value === 'string') {
        // @ts-ignore
        parsed[key] = titleCase(value)
      }

      if (key === 'location') {
        const [city, state] = parsed[key].split(', ')
        parsed.location = `${city}, ${state.toUpperCase()}`
      }
    }

    return parsed
  }
}
