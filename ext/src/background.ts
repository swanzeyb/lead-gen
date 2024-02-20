chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  console.log(changeInfo.status, tab.url)

  if (changeInfo.status !== 'complete') return

  switch (new URL(tab.url || '').pathname) {
    case '/marketplace/category/vehicles':
      {
        chrome.scripting
          // Get HTML of page
          .executeScript({
            target: { tabId },
            func: function () {
              return document.documentElement.outerHTML
            },
          })
          // Send HTML to server
          .then(([{ result }]) => {
            if (!result) return

            fetch('http://localhost:3001/dom/facebook', {
              method: 'POST',
              body: JSON.stringify({ htmlString: result }),
            })
              .then((r) => r.json())
              .then((jsonResponse) => {
                console.log(jsonResponse)
              })
          })
      }
      break
    default:
      break
  }
})
