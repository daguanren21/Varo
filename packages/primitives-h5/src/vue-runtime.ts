import { computed, ref } from 'vue'
import type { ReactiveRuntime } from '@varo/primitives-core'

export const vueReactiveRuntime: ReactiveRuntime = {
  ref,
  computed
}
