export type MenuName = string | number

export interface MenuValueRef {
  readonly value: MenuName | undefined
}

export interface MenuContext {
  activeName: MenuValueRef
  close: () => void
  toggle: (name: MenuName) => void
}

let nextMenuPopupId = 0

export function createMenuPopupId() {
  nextMenuPopupId += 1
  return `varo-menu-popup-${nextMenuPopupId}`
}

export const menuContextKey = Symbol('varo-menu')
