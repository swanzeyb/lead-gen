// chrome.runtime.sendMessage({ greeting: 'tip' })
chrome.storage.local
  .set({
    domContent: document.body.textContent,
  })
  .then(() => {
    console.log('domContent set', document.body.textContent)
  })

document.body.textContent = 'Hello from script.ts!'
