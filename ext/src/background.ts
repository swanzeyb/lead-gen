chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  console.log(changeInfo.status, tab.url)

  if (
    changeInfo.status !== 'complete' ||
    !tab.url?.includes('https://www.facebook.com/marketplace/category/vehicles')
  )
    return

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: function () {
      return document.documentElement.outerHTML
    },
  })
  if (!result) return

  const postResult = await fetch('http://localhost:3001/dom/facebook', {
    method: 'POST',
    body: JSON.stringify({ htmlString: result }),
  })

  console.log(postResult)
})
