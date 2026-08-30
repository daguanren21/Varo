import type { ReactiveRuntime } from '@varo-ui/headless'
import { computed, ref } from 'vue'

export * from '@varo-ui/h5/primitives'

export const varoReactiveRuntime: ReactiveRuntime = {
  computed,
  ref,
}
