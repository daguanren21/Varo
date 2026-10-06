import type { UseFormReturn } from '@varo-ui/headless'

export interface PublicRef<T> {
  value: T
}

export interface VaroFormContext {
  form: UseFormReturn
  disabled: PublicRef<boolean>
  showError: boolean
}

export interface VaroFormItemControlContext {
  controlId: PublicRef<string>
  defaultControlId: string
  disabled: PublicRef<boolean>
  descriptionId: string
  descriptionVisible: PublicRef<boolean>
  errorId: string
  errorVisible: PublicRef<boolean>
  invalid: PublicRef<boolean>
  labelId: string
  labelVisible: PublicRef<boolean>
}

export const formContextKey = Symbol('varo-form')

export const formItemControlContextKey = 'varo-form-item-control'

let nextFormItemId = 0

export function createFormItemId() {
  nextFormItemId += 1
  return `varo-form-item-${nextFormItemId}`
}
