import { AIRTABLE_TOKEN } from '../.env.json'

console.log(AIRTABLE_TOKEN)

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  console.log(changeInfo.status, tab.url)

  // if (
  //   changeInfo.status !== 'complete' ||
  //   !tab.url?.includes('https://www.facebook.com/marketplace/category/vehicles')
  // )
  //   return

  // console.log('tab updated', tabId, changeInfo, tab)

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: function () {
      return document.body.innerHTML
    },
  })
  if (!result) return

  console.log(result?.length)

  // const postResult = await fetch(
  //   'https://api.airtable.com/v0/appci2SPrSoo1fQyC/tbl0BAuVD74IQ0Tjh',
  //   {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       fields: {
  //         Timestamp: new Date().toISOString(),
  //         Content: result,
  //       },
  //     }),
  //   }
  // )

  // console.log(postResult)
})
