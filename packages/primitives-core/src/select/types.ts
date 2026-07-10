import type { VSelectOption, VSelectValue } from '@varo/shared'
import type { ReactiveRuntime, Ref } from '../reactive'

export type SelectValue = VSelectValue | VSelectValue[] | undefined
export type SelectOption = VSelectOption

export interface SelectRootOptions {
  runtime?: ReactiveRuntime
  defaultOpen?: boolean
  defaultValue?: SelectValue
  disabled?: Ref<boolean | undefined>
  multiple?: Ref<boolean | undefined>
  open?: Ref<boolean | undefined>
  openControlled?: Ref<boolean | undefined>
  options?: Ref<readonly SelectOption[]>
  placeholder?: Ref<string | undefined>
  readonly?: Ref<boolean | undefined>
  value?: Ref<SelectValue>
  valueControlled?: Ref<boolean | undefined>
  onOpenChange?: (open: boolean) => void
  onValueChange?: (value: SelectValue) => void
}

export interface SelectRootState {
  disabled: Ref<boolean>
  displayValue: Ref<string>
  interactive: Ref<boolean>
  multiple: Ref<boolean>
  open: Ref<boolean>
  options: Ref<readonly SelectOption[]>
  placeholder: Ref<string>
  readonly: Ref<boolean>
  value: Ref<SelectValue>
}

export interface SelectRootAttrs {
  content: Record<string, unknown>
  group: Record<string, unknown>
  label: Record<string, unknown>
  trigger: Record<string, unknown>
  value: Record<string, unknown>
}

export interface SelectRootEvents {
  close: () => void
  open: () => void
  select: (option: SelectOption) => boolean
  toggle: () => void
}

export interface SelectRootApi {
  getItemAttrs: (option: SelectOption) => Record<string, unknown>
  getGroupAttrs: () => Record<string, unknown>
  setOpen: (open: boolean) => void
  setValue: (value: SelectValue) => boolean
}

export interface UseSelectRootResult {
  api: SelectRootApi
  attrs: SelectRootAttrs
  events: SelectRootEvents
  state: SelectRootState
}
