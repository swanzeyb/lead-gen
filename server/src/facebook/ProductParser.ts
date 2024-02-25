import FBTitleParser from './TitleParser'

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
  isSponsored?: boolean
}

interface DetailedCarListingUnparsed {
  title: string
  price: string
  location: string
  miles: string
  transmission: string
  exteriorColor: string
  interiorColor: string
  fuel: string
  titleBrand: string
  description: string
  sellerName: string
  sellerJoined: string
  isSponsored: boolean
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
    | 'Fuel'
    | 'Title Brand'
    | 'Description Next'
    | 'Description'
    | 'Seller Name Next'
    | 'Seller Name'
    | 'Seller Joined'
    | 'Is Sponsored'
  private currentData: DetailedCarListingUnsettled

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

import type { TitleData } from './TitleParser'
export interface DetailedCarListing extends TitleData {
  title: string
  price: number
  location: string
  miles: number
  transmission: 'Automatic' | 'Manual' | 'Other'
  exteriorColor: string
  interiorColor: string
  fuel: string
  isCleanTitle: boolean
  description: string
  sellerName: string
  sellerJoined: number
  isSponsored: boolean
}

export default class FBProductParser {
  static extractDetails(html: string): Promise<DetailedCarListingUnparsed> {
    return new Promise((resolve, reject) => {
      const sm = new ProductDetailSM()

      const indexRewriter = new HTMLRewriter()
        .on('div[role="main"]', {
          text: ({ text }) => {
            if (text) {
              sm.input(text)
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
                    html,
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
    return {
      ...title,
      ...details,
      price: parseInt(details.price.replace(/\D/g, '')),
      miles: parseInt(details.miles.replace(/\D/g, '')),
      transmission: details.transmission.includes('Automatic')
        ? 'Automatic'
        : details.transmission.includes('Manual')
        ? 'Manual'
        : 'Other',
      isCleanTitle: details.titleBrand.includes('Clean'),
      sellerJoined: parseInt(details.sellerJoined),
      exteriorColor: details.exteriorColor.split(' ').at(-1)!,
      interiorColor: details.interiorColor.split(' ').at(-1)!,
    }
  }
}
