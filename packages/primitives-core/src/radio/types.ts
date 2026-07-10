import type { ReactiveRuntime, Ref } from '../reactive'

export type RadioValue = string | number | boolean

export interface RadioGroupOptions {
  runtime?: ReactiveRuntime
  defaultValue?: RadioValue
  disabled?: Ref<boolean | undefined>
  value?: Ref<RadioValue | undefined>
  valueControlled?: Ref<boolean | undefined>
  onValueChange?: (value: RadioValue | undefined) => void
}

export interface RadioGroupState {
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  value: Ref<RadioValue | undefined>
}

export interface RadioGroupAttrs {
  root: Record<string, unknown>
}

export interface RadioGroupEvents {
  select: (value: RadioValue) => boolean
}

export interface RadioGroupApi {
  getIndicatorAttrs: (value: RadioValue) => Record<string, unknown>
  getItemAttrs: (value: RadioValue, disabled?: boolean) => Record<string, unknown>
  select: (value: RadioValue) => boolean
}

export interface UseRadioGroupResult {
  api: RadioGroupApi
  attrs: RadioGroupAttrs
  events: RadioGroupEvents
  state: RadioGroupState
}
