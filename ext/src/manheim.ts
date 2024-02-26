const SERVER_URL = `http://localhost:3001`

export default class Manheim {
  static async clickYearInput(tabId: number) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        // @ts-ignore
        findElementByTextContent('Year')?.childNodes?.[0]?.click()
      },
      args: [],
    })

    return result
  }

  static async selectYear(tabId: number, year: string) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: (year: string) => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        findElementByTextContent(year)?.click?.()
      },
      args: [year],
    })

    return result
  }

  static async clickMakeInput(tabId: number) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        // @ts-ignore
        findElementByTextContent('Make')?.childNodes?.[0]?.click?.()
      },
    })

    return result
  }

  static async getMakeOptions(tabId: number): Promise<string[] | undefined> {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        // @ts-ignore
        return findElementByTextContent('ACURA')
          ?.parentElement?.outerText?.split?.('\n')
          ?.slice?.(1)
      },
    })

    return result
  }

  static async selectMake(tabId: number, make: string) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: (make: string) => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        findElementByTextContent(make)?.click?.()
      },
      args: [make],
    })

    return result
  }

  static async clickModelInput(tabId: number) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        // @ts-ignore
        findElementByTextContent('Model')?.childNodes?.[0]?.click?.()
      },
    })

    return result
  }

  static async getModelOptions(tabId: number): Promise<string[] | undefined> {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        return (
          findElementByTextContent('Model')
            // @ts-ignore
            ?.parentElement?.childNodes?.[1]?.innerText?.split?.('\n')
            ?.slice?.(1)
        )
      },
    })

    return result
  }

  static async selectModel(tabId: number, model: string) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: (model: string) => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        findElementByTextContent(model)?.click?.()
      },
      args: [model],
    })

    return result
  }

  static async clickStyleInput(tabId: number) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        // @ts-ignore
        findElementByTextContent('Style')?.childNodes?.[0]?.click?.()
      },
    })

    return result
  }

  static async getStyleOptions(tabId: number): Promise<string[] | undefined> {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        // @ts-ignore
        return (
          findElementByTextContent('Style')
            // @ts-ignore
            ?.parentElement?.childNodes?.[1]?.innerText?.split?.('\n')
            ?.slice?.(1)
        )
      },
    })

    return result
  }

  static async selectStyle(tabId: number, style: string) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: (style: string) => {
        function findElementByTextContent(text: string) {
          const allElements = Array.from(document.querySelectorAll('*'))
          for (let element of allElements) {
            if (element.textContent === text) {
              return element as HTMLElement
            }
          }
          return null // Element not found
        }

        findElementByTextContent(style)?.click?.()
      },
      args: [style],
    })

    return result
  }

  static async setMileAdj(tabId: number) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {},
    })

    return result
  }

  static async submitMileAdj(tabId: number, miles: string) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: (miles: string) => {
        try {
          // @ts-ignore
          document.querySelector('#Odometer > * input').value = miles
        } catch (e) {}
      },
      args: [miles],
    })

    return result
  }

  static async getHTML(tabId: number): Promise<string | undefined> {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        return document.documentElement.outerHTML
      },
    })

    return result
  }

  static async doEvaluation(tabId: number, title: string, miles: string) {
    await this.clickYearInput(tabId)
    await this.selectYear(tabId, title.split(' ')[0])
    await this.clickMakeInput(tabId)
    const makeOptions = await this.getMakeOptions(tabId)
    const makeGuess = await fetch(`${SERVER_URL}/llm/infer-model?=`, {
      method: 'GET',
      body: JSON.stringify({ title, options: makeOptions }),
    })
      .then((r) => r.json())
      .catch((e) => console.log(e))
    console.log(makeGuess)

    // await this.selectMake(tabId, makeOptions?.[0] || make)
    // await this.clickModelInput(tabId)
    // const modelOptions = await this.getModelOptions(tabId)
    // await this.selectModel(tabId, modelOptions?.[0] || model)
    // await this.clickStyleInput(tabId)
    // const styleOptions = await this.getStyleOptions(tabId)
    // await this.selectStyle(tabId, styleOptions?.[0] || style)
    // await this.submitMileAdj(tabId, miles)
    return await this.getHTML(tabId)
  }
}

/*
-- Click year
findElementByTextContent('Year').childNodes[0].click()

-- Select year
findElementByTextContent('2012').click()

-- Click make
findElementByTextContent('Make').childNodes[0].click()

-- Get make options
findElementByTextContent('ACURA').parentElement.outerText.split('\n').slice(1)

-- Click make option
findElementByTextContent('VOLKSWAGEN').click()

-- Click model
findElementByTextContent('Model').childNodes[0].click()

-- Get model options
findElementByTextContent('Model').parentElement.childNodes[1].innerText.split('\n').slice(1)

-- Click model option
findElementByTextContent('GOLF 4C').click()

-- Click style
findElementByTextContent('Style').childNodes[0].click()

-- Get style options
findElementByTextContent('Style').parentElement.childNodes[1].innerText.split('\n').slice(1)

-- Click style option
findElementByTextContent('4D HATCHBACK TDI').click()

-- Set miles
document.querySelector('#Odometer > * input').value = '180000'

-- Update MMR after miles
document.querySelector('#Odometer > * button').click()

-- Extract HTML
*/
