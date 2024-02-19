chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    changeInfo.status !== 'complete' ||
    !tab.url?.includes('https://www.facebook.com/marketplace/category/vehicles')
  )
    return

  chrome.scripting
    .executeScript({
      target: { tabId: tabId },
      files: ['out/script.js'],
    })
    .then(() => console.log('script injected'))
})
