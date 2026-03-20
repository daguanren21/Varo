import type { PressableSize, PressableVariant } from '@varo/primitives-core'

export interface ButtonRootProps {
  as?: string
  disabled?: boolean
  loading?: boolean
  size?: PressableSize
  variant?: PressableVariant
}
