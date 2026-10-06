export type TabbarName = string | number

export interface TabbarValueRef {
  readonly value: TabbarName | undefined
}

export interface TabbarContext {
  current: TabbarValueRef
  select: (name: TabbarName) => void
}

export const tabbarContextKey = Symbol('varo-tabbar')
