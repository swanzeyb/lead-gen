interface Handlers {
  [key: string]: {
    [key: string]: (request: Request) => Promise<Response>
  }
}

const handlers: Handlers = {
  '/dom/facebook': {
    POST: async (request: Request) => new Response(),
  },
}

Bun.serve({
  port: 3001, // defaults to $BUN_PORT, $PORT, $NODE_PORT otherwise 3000
  async fetch(request) {
    const url = new URL(request.url)
    const handler = handlers[url.pathname]?.[request.method]

    if (handler) {
      const result = await handler(request)
      console.log(`${result.status} ${request.method} ${url.pathname}`)
      return result
    }

    console.log(`404 ${request.method} ${url.pathname}`)
    return new Response(undefined, {
      status: 404,
    })
  },
})
