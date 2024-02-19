export default class Facebook {
  domNodes: Document

  constructor(htmlString: string) {
    const parser = new DOMParser()
    this.domNodes = parser.parseFromString(htmlString, 'text/html')
  }

  parseListings() {}

  parseAListing() {}
}
