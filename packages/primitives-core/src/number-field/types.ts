import type { ReactiveRuntime, Ref } from '../reactive'

export interface NumberFieldRootOptions {
  defaultValue?: number
  disabled?: Ref<boolean | undefined>
  max?: Ref<number | undefined>
  min?: Ref<number | undefined>
  onValueChange?: (value: number) => void
  precision?: Ref<number | undefined>
  readonly?: Ref<boolean | undefined>
  runtime?: ReactiveRuntime
  step?: Ref<number | undefined>
  value?: Ref<number | undefined>
  valueControlled?: Ref<boolean | undefined>
}

export interface NumberFieldRootState {
  canDecrease: Ref<boolean>
  canIncrease: Ref<boolean>
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  max: Ref<number>
  min: Ref<number>
  precision: Ref<number | undefined>
  readonly: Ref<boolean>
  step: Ref<number>
  value: Ref<number>
}

export interface NumberFieldRootApi {
  decrement: () => boolean
  increment: () => boolean
  normalize: (value: number) => number
  setValue: (value: number) => boolean
}

export interface NumberFieldRootEvents {
  decrement: () => boolean
  increment: () => boolean
  input: (value: number) => boolean
}

export interface NumberFieldRootAttrs {
  decrement: Record<string, unknown>
  increment: Record<string, unknown>
  input: Record<string, unknown>
  root: Record<string, unknown>
}

export interface UseNumberFieldRootResult {
  api: NumberFieldRootApi
  attrs: NumberFieldRootAttrs
  events: NumberFieldRootEvents
  state: NumberFieldRootState
}
