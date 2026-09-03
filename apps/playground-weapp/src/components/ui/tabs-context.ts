export type TabName = string | number

export interface TabRegistration {
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
  unregisterTab: (name: TabName) => void
}

let nextTabsRootId = 0

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
