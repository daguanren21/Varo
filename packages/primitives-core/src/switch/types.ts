import type { ReactiveRuntime, Ref } from '../reactive'

export interface SwitchRootOptions {
  runtime?: ReactiveRuntime
  checked?: Ref<boolean | undefined>
  checkedControlled?: Ref<boolean | undefined>
  defaultChecked?: boolean
  disabled?: Ref<boolean | undefined>
  loading?: Ref<boolean | undefined>
  onCheckedChange?: (checked: boolean) => void
}

export interface SwitchRootState {
  checked: Ref<boolean>
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  loading: Ref<boolean>
}

export interface SwitchRootAttrs {
  root: Record<string, unknown>
  thumb: Record<string, unknown>
}

export interface SwitchRootEvents {
  toggle: () => boolean
}

export interface SwitchRootApi {
  setChecked: (checked: boolean) => boolean
}

export interface UseSwitchRootResult {
  api: SwitchRootApi
  attrs: SwitchRootAttrs
  events: SwitchRootEvents
  state: SwitchRootState
}
