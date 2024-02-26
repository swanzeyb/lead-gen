import { FBData, FBCatalogParser, FBProductParser } from './facebook'
import LLM from './LLM'

LLM.guessModel('2012 Volkswagen golf TDI Hatchback 4D')
  .then((r) => console.log(r))
  .catch((e) => console.log(e))

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
  '/llm/infer-model': {
    POST: async (request: Request) => {
      const url = new URL(request.url)
      const title = url.searchParams.get('title')
      const options = url.searchParams.get('options')?.split(',')

      if (!title) throw new Error('No title provided')
      if (!options) throw new Error('No options provided')
      console.log(title, options)

      const model = await LLM.guessModel(title, options)

      return new Response(JSON.stringify({ model }), {
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
