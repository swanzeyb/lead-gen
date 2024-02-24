const makeEdgeCaseList = [
  'Land Rover',
  'Mini Cooper',
  'Alfa Romeo',
  'Aston Martin',
]

// ['Sport Utility', 'Utility Pickup', 'Minivan', 'Pickup', 'Wagon']
const modelIdentifiers = new Set([
  'Sport',
  'Utility',
  'Minivan',
  'Pickup',
  'Wagon',
])

interface TitleDataUnsettled {
  year?: number
  make?: string
  model?: string
  doors?: number
  class?: string
}

interface TitleData {
  year: number
  make: string
  model: string
  doors?: number
  class?: string
}

export class TitleSM {
  private currentState: 'Start' | 'Year' | 'Make Continued' | 'Model' | 'Doors'
  private currentData: TitleDataUnsettled

  constructor() {
    this.currentState = 'Start'
    this.currentData = {}
  }

  input(str: string) {
    switch (this.currentState) {
      case 'Start':
        this.currentState = 'Year'
        this.currentData.year = parseInt(str)
        break
      case 'Year':
        if (makeEdgeCaseList.some((make) => make.includes(str))) {
          // It's a two-word make
          this.currentState = 'Make Continued'
        } else {
          this.currentState = 'Model'
        }
        this.currentData.make = str
        break
      case 'Make Continued':
        this.currentState = 'Model'
        this.currentData.make += ` ${str}`
        break
      case 'Model':
        if (modelIdentifiers.has(str)) {
          this.currentState = 'Doors'

          switch (str) {
            case 'Sport':
              this.currentData.class = 'SUV'
              break
            case 'Utility':
              this.currentData.class = 'Pickup'
              break
            default:
              this.currentData.class = str
              break
          }
        } else {
          this.currentData.model ??= ''
          this.currentData.model += ` ${str}`
          this.currentData.model = this.currentData.model.trim()
        }
        break
      case 'Doors':
        if (/\b\d+D\b/i.test(str)) {
          const [count] = str

          this.currentData.doors = parseInt(count)
        }
    }
  }

  isAccepted() {
    return this.currentState === 'Model' || this.currentState === 'Doors'
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

export default class FBTitleParser {
  static async parseTitle(title: string) {
    const sm = new TitleSM()

    for (const word of title.split(' ')) {
      sm.input(word)
    }

    if (!sm.isAccepted()) {
      throw new Error('Title not accepted', {
        cause: {
          currentState: sm.getState(),
          currentData: sm.getData(),
          title,
        },
      })
    }

    return sm.getData() as TitleData
  }
}
