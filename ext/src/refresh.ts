import dayjs from 'dayjs'
import { ActivePathName } from './config'

const REFRESH_INTERVAL = 15 // minutes

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
  chrome.tabs.query({ active: true }, (tabs) => {
    const { id } = tabs[0]
    chrome.tabs.reload(id!)
  })
}

export async function nextRefresh(alias: keyof typeof ActivePathName) {
  const key = `last-refresh:${alias}`
  const { lastRefresh } = (await getStorageAsync(key)) as any
  return REFRESH_INTERVAL - dayjs().diff(dayjs(lastRefresh), 'minute')
}

export async function shouldRefresh(alias: keyof typeof ActivePathName) {
  const key = `last-refresh:${alias}`
  const now = dayjs()
  const diff = await nextRefresh(alias)

  if (diff <= REFRESH_INTERVAL) {
    await setStorageAsync(key, now)
    return true
  } else {
    return false
  }
}
