import type { RetailStore } from './store'
import { onLoad } from 'wevu'
import { errorMessage } from './service'
import { useRetailStore } from './store'

export interface RetailPage extends RetailStore {
  retryLoad: () => Promise<void>
}

export async function runRetailAction(
  action: () => unknown | Promise<unknown>,
  displayedError?: () => string,
): Promise<void> {
  try { await action() }
  catch (error) {
    const message = errorMessage(error)
    // Keep a duplicate toast from covering the page's own error and retry controls.
    if (!message || displayedError?.() !== message) {
      wx.showToast({ title: message, icon: 'none' })
    }
  }
}

export function useRetailPage(): RetailPage {
  const retail = useRetailStore()
  const retryLoad = () => runRetailAction(retail.load, () => retail.loadError.value)
  onLoad(retryLoad)
  return { ...retail, retryLoad }
}
