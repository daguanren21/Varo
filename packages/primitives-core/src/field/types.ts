import type { Ref } from 'vue'

export interface FieldRootOptions {
  defaultValue?: string
  value?: Ref<string | undefined>
  disabled?: Ref<boolean | undefined>
  invalid?: Ref<boolean | undefined>
  onValueChange?: (value: string) => void
}

export interface FieldRootState {
  value: Ref<string>
  disabled: Ref<boolean>
  invalid: Ref<boolean>
  interactive: Ref<boolean>
}

export interface FieldRootAttrs {
  input: Record<string, unknown>
}

export interface FieldRootEvents {
  input: (value: string) => boolean
  clear: () => void
}

export interface FieldRootApi {
  setValue: (value: string) => boolean
  clear: () => void
}

export interface UseFieldRootResult {
  state: FieldRootState
  attrs: FieldRootAttrs
  events: FieldRootEvents
  api: FieldRootApi
}
