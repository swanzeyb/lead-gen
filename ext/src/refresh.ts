import dayjs from 'dayjs'
import { ActivePathName } from './config'

const REFRESH_INTERVAL = 1 // 1 minutes

export const getStorageAsync = (key: string) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result)
    })
  })
}

export const setStorageAsync = (key: string, value: any) => {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve()
    })
  })
}

export const refresh = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { id } = tabs[0]
    chrome.tabs.reload(id!)
  })
}

export async function shouldRefresh(alias: keyof typeof ActivePathName) {
  const key = `last-refresh:${alias}`
  const { lastRefresh } = (await getStorageAsync(key)) as any
  const now = dayjs()
  const diff = now.diff(dayjs(lastRefresh), 'minute')

  if (diff > REFRESH_INTERVAL) {
    await setStorageAsync(key, now)
    return true
  } else {
    return false
  }
}
