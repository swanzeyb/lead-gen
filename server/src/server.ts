import Facebook from './models/Facebook'

interface Handlers {
  [key: string]: {
    [key: string]: (request: Request) => Promise<Response>
  }
}

const handlers: Handlers = {
  '/dom/facebook': {
    POST: async (request: Request) => {
      // Require body contents
      if (!request.body) throw new Error('No body contents')

      // Add to index
      const { htmlString } = (await request.json()) as { htmlString: string }
      const domId = await Facebook.addIndex(htmlString)
      const details = await Facebook.parseIndex(htmlString)
      const carIds = await Facebook.setDetail(details)

      console.log({ domId, carIds })

      // Return with db id for dom content and ids for car ids
      return new Response(JSON.stringify({ domId, carIds }), {
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
