import { FBData, FBCatalogParser, FBProductParser } from './facebook'

const catalog = await FBData.getProductHTML({
  id: '1bcb9b4b-6629-43aa-b285-0376c453401f',
})

const extraction = await FBProductParser.extractDetails(catalog.html)
const parsed = await FBProductParser.parseDetails(extraction)

console.log(parsed)

// const listings = await FBCatalogParser.parseDetails(extraction)

// const ids = await FBData.setCatalog(listings)
// console.log(ids)

interface Handlers {
  [key: string]: {
    [key: string]: (request: Request) => Promise<Response>
  }
}

const handlers: Handlers = {
  '/dom/facebook/catalog': {
    POST: async (request: Request) => {
      // Require body contents
      if (!request.body) throw new Error('No body contents')

      // Add to index
      const { htmlString } = (await request.json()) as { htmlString: string }
      const domId = await FBData.setCatalogHTML(htmlString)
      const details = await FBCatalogParser.extractDetails(htmlString)
      const parsed = await FBCatalogParser.parseDetails(details)
      const carIds = await FBData.setCatalog(parsed)

      // console.log({ domId, carIds })
      console.log(parsed)

      // Return with db id for dom content and ids for car ids
      return new Response(JSON.stringify({ domId, carIds }), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
  },
  '/dom/facebook/product': {
    POST: async (request: Request) => {
      // Require body contents
      if (!request.body) throw new Error('No body contents')

      // Add to index
      const { htmlString } = (await request.json()) as { htmlString: string }
      const domId = await FBData.setProductHTML(htmlString)
      const details = await FBProductParser.extractDetails(htmlString)

      console.log(details)
      // const parsed = await FBProductParser.parseDetails(details)
      // const carId = await FBData.setProduct(parsed)

      // console.log({ domId, carId })

      // Return with db id for dom content and ids for car ids
      return new Response(JSON.stringify({ domId, details }), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
  },
}

Bun.serve({
  port: 3001, // defaults to $BUN_PORT, $PORT, $NODE_PORT otherwise 3000
  async fetch(request) {
    const url = new URL(request.url)
    const handler = handlers[url.pathname]?.[request.method]

    try {
      const result = await handler(request)
      console.log(`${result.status} ${request.method} ${url.pathname}`)
      return result
    } catch {}

    console.log(`404 ${request.method} ${url.pathname}`)
    return new Response(undefined, {
      status: 404,
    })
  },
})
