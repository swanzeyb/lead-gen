import { FBData, FBCatalogParser, FBProductParser } from './facebook'

const toExport = ['8c674234-a130-4d99-98ea-ffdbc4cf19e0'] // 0396e0f5-8546-48f5-beb4-507ebcdce666, c4115066-ea7f-4875-ab24-9d9f56ba5b47, 96148c12-fa34-4544-9170-178df32346fb

for (const id of toExport) {
  FBData.getProductHTML({ id }).then(async (data) => {
    const extraction = await FBProductParser.extractDetails(data.html)
    console.log(extraction)
    const parsed = await FBProductParser.parseDetails(extraction)

    Bun.write(
      `./tests/product-parser-test-${id}.json`,
      JSON.stringify({ parsed, html: data.html }, null, 2)
    )

    console.log(parsed)
  })
}

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
  // '/dom/facebook/catalog': {
  //   POST: async (request: Request) => {
  //     // Require body contents
  //     if (!request.body) throw new Error('No body contents')

  //     // Add to index
  //     const { htmlString } = (await request.json()) as { htmlString: string }
  //     const domId = await FBData.setCatalogHTML(htmlString)
  //     const details = await FBCatalogParser.extractDetails(htmlString)
  //     const parsed = await FBCatalogParser.parseDetails(details)
  //     const carIds = await FBData.setCatalog(parsed)

  //     // console.log({ domId, carIds })

  //     // Return with db id for dom content and ids for car ids
  //     return new Response(JSON.stringify({ domId, carIds }), {
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     })
  //   },
  // },
  '/dom/facebook/product': {
    POST: async (request: Request) => {
      // Require body contents
      if (!request.body) throw new Error('No body contents')

      // Add to index
      const { htmlString } = (await request.json()) as { htmlString: string }
      const domId = await FBData.setProductHTML(htmlString)

      // const details = await FBProductParser.extractDetails(htmlString)

      // console.log(details)
      // const parsed = await FBProductParser.parseDetails(details)
      // const carId = await FBData.setProduct(parsed)

      // console.log({ domId, carId })

      // Return with db id for dom content and ids for car ids
      return new Response(JSON.stringify({ domId }), {
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
