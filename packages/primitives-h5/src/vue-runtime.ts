import type { ReactiveRuntime } from '@varo-ui/headless'
import { computed, ref } from 'vue'

export const vueReactiveRuntime: ReactiveRuntime = {
  ref,
  computed,
}
