const SERVER_URL = `http://localhost:3001`

const toRefresh = new Set<number>() // Set of tab IDs to refresh

// Refresh Catalog page
setInterval(async function () {
  for (const tabId of toRefresh) {
    try {
      chrome.tabs.reload(tabId)
    } catch (e) {
      toRefresh.delete(tabId)
    }
  }
}, 1000 * 60 * 1) // 1 minute

const toFetchProduct = new Set<number>()

// Fetch product details
setInterval(async function () {
  for (const tabId of toFetchProduct) {
    try {
      const [{ url, fbID }] = await fetch(
        `${SERVER_URL}/worker/facebook/product/todo`
      ).then((r) => r.json())

      const tab = await chrome.tabs.update(tabId, { url })
      console.log(tab)

      // Wait for page to load for this tabId
      await new Promise<void>((resolve) => {
        chrome.tabs.onUpdated.addListener(async function (
          thisTabId,
          changeInfo,
          tab
        ) {
          if (
            tabId === thisTabId &&
            changeInfo.status === 'complete' &&
            tab.url
          ) {
            if (new URL(tab.url).pathname === new URL(url).pathname) {
              resolve()
            }
          }
        })
      })

      // Get HTML off page
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId },
        func: function () {
          return document.documentElement.outerHTML
        },
      })

      // Send HTML to server
      try {
        await fetch(`${SERVER_URL}/dom/facebook/catalog`, {
          method: 'POST',
          body: JSON.stringify({ htmlString: result, fbID }),
        })
          .then((r) => r.json())
          .then((jsonResponse) => {
            console.log(jsonResponse)
          })
      } catch (error) {
        console.log('Error sending HTML to server', error)
      }
    } catch (e) {
      console.log('Error getting product details', e)
    }
  }
}, 1000 * 60 * 0.5 + Math.random() * 1000 * 60) // 30 seconds + random 0-1 minute

const toFetchMMR = new Set<number>()

import Manheim from './manheim'
import debounce from 'debounce'

let evalInProgress = false

const onUpdate = debounce(async function (
  tabId: number,
  changeInfo: any,
  tab: any
) {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url)

    if (url.pathname === '/marketplace/category/vehicles') {
      // toRefresh.add(tabId)
    } else if (url.pathname.includes('/marketplace/item/')) {
      // toFetchProduct.add(tabId)
    } else if (url.pathname === '/ui-mmr/' && !evalInProgress) {
      toFetchMMR.add(tabId)
      console.log(changeInfo.status, url, tab.url, tab.id)

      evalInProgress = true
      await Manheim.doEvaluation(
        tabId,
        '2012 Volkswagen golf TDI Hatchback 4D',
        '180000'
      )
      evalInProgress = false
    }
  }
},
800)

chrome.tabs.onUpdated.addListener(onUpdate)
