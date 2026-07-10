import type { SelectOption, SelectValue as SelectPrimitiveValue } from '@varo/primitives-core'

export interface SelectPartProps {
  as?: string
  externalClasses?: string[]
}

export interface SelectRootProps {
  defaultOpen?: boolean
  defaultValue?: SelectPrimitiveValue
  disabled?: boolean
  multiple?: boolean
  open?: boolean
  options?: SelectOption[]
  placeholder?: string
  readonly?: boolean
  value?: SelectPrimitiveValue
}

export type { SelectOption, SelectPrimitiveValue }
