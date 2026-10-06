import type { ReactiveRuntime, Ref } from '@varo/shared'

export interface FieldRootOptions {
  runtime?: ReactiveRuntime
  defaultValue?: string
  value?: Ref<string | undefined>
  valueControlled?: Ref<boolean | undefined>
  disabled?: Ref<boolean | undefined>
  readonly?: Ref<boolean | undefined>
  invalid?: Ref<boolean | undefined>
  onValueChange?: (value: string) => void
}

export interface FieldRootState {
  value: Ref<string>
  disabled: Ref<boolean>
  readonly: Ref<boolean>
  invalid: Ref<boolean>
  interactive: Ref<boolean>
}

export interface FieldRootAttrs {
  input: Record<string, unknown>
}

export interface FieldRootEvents {
  input: (value: string) => boolean
  clear: () => boolean
}

export interface FieldRootApi {
  setValue: (value: string) => boolean
  clear: () => boolean
}

export interface UseFieldRootResult {
  state: FieldRootState
  attrs: FieldRootAttrs
  events: FieldRootEvents
  api: FieldRootApi
}
