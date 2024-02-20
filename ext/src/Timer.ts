import { ActivePathName } from './config'
import { shouldRefresh, refresh, nextRefresh } from './refresh'
import dayjs from 'dayjs'

export default class Timer {
  private static instance: Timer

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor(tabId: number, alias: keyof typeof ActivePathName) {
    Timer.refreshTimer(tabId, alias)
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static start(
    tabId: number,
    alias: keyof typeof ActivePathName
  ): Timer {
    if (!Timer.instance) {
      Timer.instance = new Timer(tabId, alias)
    }

    return Timer.instance
  }

  private static async refreshTimer(
    tabId: number,
    alias: keyof typeof ActivePathName,
    timeout: number = 1000 * 60 * 1
  ) {
    console.log('Starting timer')
    while (true) {
      const should = await shouldRefresh(alias)
      console.log('Should refresh:', should)
      console.time('Eval Loop')
      if (should) {
        console.log(
          `Refreshing ${alias}: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
        )
        nextRefresh(alias).then((next) => {
          console.log(`Next refresh in ${next} minutes.`)
        })
        refresh()
      }
      await Timer.domSetTimeout(tabId, timeout)
      console.timeEnd('Eval Loop')
    }
  }

  private static async domSetTimeout(tabId: number, timeout: number) {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: async function () {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, timeout)
        })
      },
    })
  }
}

// Singleton Credit: https://refactoring.guru/design-patterns/singleton/typescript/example
