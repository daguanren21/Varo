import type { MaybeRef, ReactiveRuntime, Ref } from '../reactive'

export type TabsValue = string | number
export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsNavigationKey =
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Home'
  | 'End'

export interface TabsNavigationOptions {
  currentIndex: number
  itemCount: number
  key: TabsNavigationKey
  orientation: TabsOrientation
}

export interface TabsRootOptions {
  runtime?: ReactiveRuntime
  defaultValue?: TabsValue
  disabled?: Ref<boolean | undefined>
  id?: MaybeRef<string | undefined>
  orientation?: MaybeRef<TabsOrientation | undefined>
  value?: Ref<TabsValue | undefined>
  valueControlled?: Ref<boolean | undefined>
  onValueChange?: (value: TabsValue | undefined) => void
}

export interface TabsRootState {
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  orientation: Ref<TabsOrientation>
  value: Ref<TabsValue | undefined>
}

export interface TabsRootAttrs {
  list: Record<string, unknown>
  root: Record<string, unknown>
}

export interface TabsRootEvents {
  select: (value: TabsValue) => boolean
}

export interface TabsRootApi {
  getContentAttrs: (value: TabsValue) => Record<string, unknown>
  getTriggerAttrs: (value: TabsValue, disabled?: boolean) => Record<string, unknown>
  select: (value: TabsValue) => boolean
}

export interface UseTabsRootResult {
  api: TabsRootApi
  attrs: TabsRootAttrs
  events: TabsRootEvents
  state: TabsRootState
}
