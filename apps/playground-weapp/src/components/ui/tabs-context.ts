export type TabName = string | number

export interface TabRegistration {
  readonly token: number
  disabled: boolean
  name: TabName
  title: string
}

export interface TabsValueRef {
  readonly value: TabName | undefined
}

export interface VaroTabsContext {
  active: TabsValueRef
  registerTab: (tab: TabRegistration) => void
  rootId: string
  unregisterTab: (token: TabRegistration['token']) => void
}

let nextTabsRootId = 0
let nextTabToken = 0

export function createTabToken() {
  nextTabToken += 1
  return nextTabToken
}

export function createTabsRootId() {
  nextTabsRootId += 1
  return `varo-tabs-${nextTabsRootId}`
}

function encodeTabName(name: TabName) {
  return `${typeof name === 'number' ? 'n' : 's'}-${encodeURIComponent(String(name))}`
}

export function getTabsTriggerId(rootId: string, name: TabName) {
  return `${rootId}-trigger-${encodeTabName(name)}`
}

export function getTabsPanelId(rootId: string, name: TabName) {
  return `${rootId}-panel-${encodeTabName(name)}`
}

export const tabsContextKey = Symbol('varo-tabs')
