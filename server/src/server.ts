import { FBData, FBCatalogParser, FBProductParser } from './facebook'
import MHData from './manheim/Data'
import LLM from './LLM'

console.log('Starting server')

interface Handlers {
  [key: string]: {
    [key: string]: (request: Request) => Promise<Response>
  }
}

const handlers: Handlers = {
  '/dom/manheim/values': {
    POST: async (request: Request) => {
      try {
        // Require body contents
        if (!request.body) throw new Error('No body contents')

        // Add to index
        const { values } = (await request.json()) as { values: string }
        const domId = await MHData.setValuesHTML(values)

        // Return with db id for dom content and ids for car ids
        return new Response(JSON.stringify({ domId }), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (e) {
        console.log('Error adding manheim html', e)
        return new Response(JSON.stringify({ cause: e }), {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 500,
        })
      }
    },
  },
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
    GET: async (request: Request) => {
      try {
        const url = new URL(request.url)
        const title = url.searchParams.get('title')
        const options = url.searchParams.get('options')?.split(',')

        if (!title) throw new Error('No title provided')
        if (!options) throw new Error('No options provided')

        const model = await LLM.guessModel(title, options)

        return new Response(JSON.stringify({ model }), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (e) {
        console.log('Error guessing model', { cause: e })
        return new Response(JSON.stringify({ cause: e }), {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 500,
        })
      }
    },
  },
  '/llm/infer-make': {
    GET: async (request: Request) => {
      try {
        const url = new URL(request.url)
        const title = url.searchParams.get('title')
        const options = url.searchParams.get('options')?.split(',')

        if (!title) throw new Error('No title provided')
        if (!options) throw new Error('No options provided')

        const make = await LLM.guessMake(title, options)

        return new Response(JSON.stringify({ make }), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (e) {
        console.log('Error guessing make', { cause: e })
        return new Response(JSON.stringify({ cause: e }), {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 500,
        })
      }
    },
  },
  '/llm/infer-style': {
    GET: async (request: Request) => {
      try {
        const url = new URL(request.url)
        const title = url.searchParams.get('title')
        const options = url.searchParams.get('options')?.split(',')

        if (!title) throw new Error('No title provided')
        if (!options) throw new Error('No options provided')

        const style = await LLM.guessStyle(title, options)

        return new Response(JSON.stringify({ style }), {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } catch (e) {
        console.log('Error guessing style', { cause: e })
        return new Response(JSON.stringify({ cause: e }), {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 500,
        })
      }
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
