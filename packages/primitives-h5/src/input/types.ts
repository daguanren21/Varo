export interface InputRootProps {
  disabled?: boolean
  invalid?: boolean
  readonly?: boolean
  value?: string
  defaultValue?: string
  placeholder?: string
  type?: string
  maxLength?: number | string
  formatter?: (value: string) => string
  formatTrigger?: 'onInput' | 'onBlur'
  rows?: number | string
  autosize?: boolean | { minRows?: number; maxRows?: number }
}
