import { FBData, FBProductParser } from '.'
import { readdir } from 'node:fs/promises'

export async function runTests() {
  const files = await readdir('./tests')

  const tests = files.filter((file) => file.startsWith('product-parser-test-'))
  for (const file of tests) {
    const { html, parsed } = await Bun.file(`./tests/${file}`).json()
    const extraction = await FBProductParser.extractDetails(html)
    const parsed2 = await FBProductParser.parseDetails(extraction)

    // @ts-ignore
    const errors = []
    Object.keys(parsed).forEach((key) => {
      // @ts-ignore
      if (parsed[key] !== parsed2[key]) {
        errors.push(key)
      }
    })

    if (errors.length) {
      // @ts-ignore
      const [key] = errors
      // @ts-ignore
      throw new Error('Test Failed', {
        cause: {
          file,
          key,
          expected: parsed[key],
          received: parsed2[key],
        },
      })
    }
  }

  console.log('All Product Parsers Tests Passed!')
}

function generateTest() {
  const toExport = ['41706288-bc46-4558-b760-e4f5ac3a16eb'] // 0396e0f5-8546-48f5-beb4-507ebcdce666, c4115066-ea7f-4875-ab24-9d9f56ba5b47, 96148c12-fa34-4544-9170-178df32346fb

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
}
