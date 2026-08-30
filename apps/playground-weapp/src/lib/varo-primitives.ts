import type { ReactiveRuntime } from '@varo-ui/headless'
import { computed, shallowRef } from 'wevu'

export * from '@varo-ui/weapp/primitives'

export const varoReactiveRuntime: ReactiveRuntime = {
  computed,
  ref: shallowRef,
}
