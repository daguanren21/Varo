import type { ReactiveRuntime, Ref } from '../reactive'

export interface CheckboxRootOptions {
  runtime?: ReactiveRuntime
  checked?: Ref<boolean | undefined>
  checkedControlled?: Ref<boolean | undefined>
  defaultChecked?: boolean
  disabled?: Ref<boolean | undefined>
  onCheckedChange?: (checked: boolean) => void
}

export interface CheckboxRootState {
  checked: Ref<boolean>
  disabled: Ref<boolean>
  interactive: Ref<boolean>
}

export interface CheckboxRootAttrs {
  indicator: Record<string, unknown>
  root: Record<string, unknown>
}

export interface CheckboxRootEvents {
  toggle: () => boolean
}

export interface CheckboxRootApi {
  setChecked: (checked: boolean) => boolean
}

export interface UseCheckboxRootResult {
  api: CheckboxRootApi
  attrs: CheckboxRootAttrs
  events: CheckboxRootEvents
  state: CheckboxRootState
}
