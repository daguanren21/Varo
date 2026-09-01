import type { UseFormReturn } from '@varo-ui/headless'

export interface VaroFormContext {
  form: UseFormReturn
  showError: boolean
}

export const formContextKey = Symbol('varo-form')
