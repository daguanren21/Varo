import type { ReactiveRuntime, Ref } from '@varo/shared'

export type InputOtpPattern = string | RegExp
export type InputOtpInputMode = 'none' | 'text' | 'decimal' | 'tel' | 'search' | 'email' | 'url' | 'numeric'

export interface InputOtpRootOptions {
  runtime?: ReactiveRuntime
  value?: Ref<string | undefined>
  valueControlled?: Ref<boolean | undefined>
  defaultValue?: string
  length?: Ref<number | undefined>
  pattern?: Ref<InputOtpPattern | undefined>
  inputMode?: Ref<InputOtpInputMode | undefined>
  disabled?: Ref<boolean | undefined>
  invalid?: Ref<boolean | undefined>
  readonly?: Ref<boolean | undefined>
  accessibleLabel?: Ref<string | undefined>
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
}

export interface InputOtpRootState {
  value: Ref<string>
  length: Ref<number>
  activeIndex: Ref<number>
  complete: Ref<boolean>
  disabled: Ref<boolean>
  invalid: Ref<boolean>
  interactive: Ref<boolean>
  readonly: Ref<boolean>
  focused: Ref<boolean>
}

export interface InputOtpRootAttrs {
  root: Record<string, unknown>
  input: Record<string, unknown>
}

export interface InputOtpRootEvents {
  input: (value: string) => boolean
  clear: () => boolean
  focus: () => void
  blur: () => void
}

export interface InputOtpRootApi {
  setValue: (value: string) => boolean
}

export interface UseInputOtpRootResult {
  state: InputOtpRootState
  attrs: InputOtpRootAttrs
  events: InputOtpRootEvents
  api: InputOtpRootApi
}
