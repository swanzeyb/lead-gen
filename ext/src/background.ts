import { ActivePathName } from './config'
import { shouldRefresh, nextRefresh } from './refresh'
import dayjs from 'dayjs'

class FacebookIndex {
  static async sendHTML(tabId: number) {
    // Get HTML off page
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: function () {
        return document.documentElement.outerHTML
      },
    })

    // Send HTML to server
    try {
      await fetch('http://localhost:3001/dom/facebook/index', {
        method: 'POST',
        body: JSON.stringify({ htmlString: result }),
      })
        .then((r) => r.json())
        .then((jsonResponse) => {
          console.log(jsonResponse)
        })
    } catch (error) {
      console.log('Error sending HTML to server', error)
    }
  }
}

class FacebookPost {
  static async sendHTML(tabId: number) {
    // Get HTML off page
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: function () {
        return document.documentElement.outerHTML
      },
    })

    // Send HTML to server
    try {
      await fetch('http://localhost:3001/dom/facebook/post', {
        method: 'POST',
        body: JSON.stringify({ htmlString: result }),
      })
        .then((r) => r.json())
        .then((jsonResponse) => {
          console.log(jsonResponse)
        })
    } catch (error) {
      console.log('Error sending HTML to server', error)
    }
  }
}

// var timer: { [alias: string]: Timer | undefined } = {}

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  console.log(changeInfo.status, tab.url)

  // Move to next step if page is ready and has a URL
  if (changeInfo.status !== 'complete' || !tab.url) return

  switch (new URL(tab.url).pathname) {
    case ActivePathName['facebook:index']:
      {
        const alias = 'facebook:index'
        FacebookIndex.sendHTML(tabId)

        const timer = setInterval(async () => {
          const should = await shouldRefresh(alias)
          const next = await nextRefresh(alias)
          console.log(`Next refresh in ${next} minutes.`)
          if (!should) return

          try {
            await chrome.tabs.reload(tabId)
            console.log(
              `Refreshed ${alias}: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
            )
          } catch (error) {
            clearInterval(timer)
          }
        }, 1000 * 60 * 0.5)
      }
      break
    default:
      if (tab.url.includes('/marketplace/item/')) {
        FacebookPost.sendHTML(tabId)
      }
      break
  }
})
