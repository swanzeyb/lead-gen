import { ActivePathName } from './config'

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
      await fetch('http://localhost:3001/dom/facebook', {
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

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  console.log(changeInfo.status, tab.url)

  if (changeInfo.status !== 'complete') return

  switch (new URL(tab.url || '').pathname) {
    case ActivePathName['facebook:index']:
      {
        FacebookIndex.sendHTML(tabId)
      }
      break
    default:
      break
  }
})
