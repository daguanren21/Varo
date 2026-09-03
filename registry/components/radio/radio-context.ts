export type RadioValue = boolean | number | string
export type SelectionDirection = 'horizontal' | 'vertical'

export interface RadioGroupContext {
  disabled: () => boolean
  isChecked: (value: RadioValue) => boolean
  select: (value: RadioValue) => void
}

export const radioGroupKey = Symbol('varo-radio-group')
