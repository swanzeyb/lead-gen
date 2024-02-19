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
      return document.body.textContent
    },
  })

  // chrome.scripting
  //   .executeScript({
  //     target: { tabId: tabId },
  //     files: ['out/script.js'],
  //   })
  //   .then(() => console.log('script injected'))
})
