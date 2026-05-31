import type { ReactiveRuntime, Ref } from '../reactive'

export type PressableSize = 'sm' | 'md' | 'lg'
export type PressableVariant = 'solid' | 'ghost' | 'outline'

export interface PressableRootOptions {
  runtime?: ReactiveRuntime
  disabled?: Ref<boolean | undefined>
  loading?: Ref<boolean | undefined>
  size?: Ref<PressableSize | undefined>
  variant?: Ref<PressableVariant | undefined>
}

export interface PressableRootState {
  disabled: Ref<boolean>
  interactive: Ref<boolean>
  loading: Ref<boolean>
  pressed: Ref<boolean>
  size: Ref<PressableSize>
  variant: Ref<PressableVariant>
}

export interface PressableRootAttrs {
  root: Record<string, unknown>
}

export interface PressableRootEvents {
  pressStart: () => void
  pressEnd: () => void
  pressCancel: () => void
  click: (event?: Event) => boolean
}

export interface UsePressableRootResult {
  state: PressableRootState
  attrs: PressableRootAttrs
  events: PressableRootEvents
}
