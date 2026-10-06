import type { RetailStore } from './store'
import { onLoad } from 'wevu'
import { errorMessage } from './service'
import { useRetailStore } from './store'

export interface RetailPage extends RetailStore {
  retryLoad: () => Promise<void>
}

export async function runRetailAction(action: () => unknown | Promise<unknown>): Promise<void> {
  try { await action() }
  catch (error) { wx.showToast({ title: errorMessage(error), icon: 'none' }) }
}

export function useRetailPage(): RetailPage {
  const retail = useRetailStore()
  const retryLoad = () => runRetailAction(retail.load)
  onLoad(retryLoad)
  return { ...retail, retryLoad }
}
