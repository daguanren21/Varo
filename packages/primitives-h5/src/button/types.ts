import type { PressableSize, PressableVariant } from '@varo-ui/headless'

export interface ButtonRootProps {
  as?: string
  disabled?: boolean
  loading?: boolean
  nativeType?: 'button' | 'submit' | 'reset'
  size?: PressableSize
  variant?: PressableVariant
}
