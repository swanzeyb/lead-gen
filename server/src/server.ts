import Facebook from './models/Facebook'

const latest = await Facebook.getIndex()

// await Bun.write(Bun.file('./example.html'), latest.html)

Facebook.parseIndex(latest.html)

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
      const id = await Facebook.addIndex(htmlString)

      // Return with db id
      return new Response(JSON.stringify({ id }), {
        headers: { 'Content-Type': 'application/json' },
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
