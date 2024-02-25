import { FBData, FBCatalogParser, FBProductParser } from './facebook'
import Airtable from './Airtable'

// // @ts-ignore
// const doc = await FBData.getHTML({ type: 'index' })
// const details = await FBCatalogParser.extractDetails(doc.html)
// const parsed = await FBCatalogParser.parseDetails(details)

const data = await FBData.getCatalog({ limit: 5 })

// const data = await FBData.getProductHTML({
//   id: 'cf306959-4857-4552-aead-6b17f4996e96',
// })

// const extraction = await FBProductParser.extractDetails(data.html)
// // const parsed = await FBProductParser.parseDetails(extraction)

// console.log(extraction)

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

      try {
        const details = await FBCatalogParser.extractDetails(htmlString)
        const parsed = await FBCatalogParser.parseDetails(details)
        await FBData.setCatalog(parsed)
      } catch (e) {
        console.log(e)
      }

      // Return with db id for dom content and ids for car ids
      return new Response(JSON.stringify({ domId }), {
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
      const { htmlString, fbID } = (await request.json()) as {
        htmlString: string
        fbID: string
      }
      const domId = await FBData.setProductHTML(htmlString)

      try {
        const details = await FBProductParser.extractDetails(htmlString)
        const parsed = await FBProductParser.parseDetails(details)

        await FBData.setProduct({
          ...parsed,
          fbID,
        })

        await FBData.updateCatalogStatus({ fbID, status: 'complete' })
      } catch (e) {
        console.log(e)
      }

      // Return with db id for dom content and ids for car ids
      return new Response(JSON.stringify({ domId }), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    },
  },
  '/worker/facebook/product/todo': {
    GET: async (request: Request) => {
      const jobs = await FBData.searchCatalog({
        limit: 1,
        query: 'Subaru',
        price: 7000,
      }).catch((e) => console.log(e))

      return new Response(JSON.stringify(jobs), {
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
