import { computed, ref } from 'vue'
import type { PressableRootOptions, UsePressableRootResult } from './types'

export function usePressableRoot(options: PressableRootOptions = {}): UsePressableRootResult {
  const pressed = ref(false)
  const disabled = computed(() => options.disabled?.value ?? false)
  const loading = computed(() => options.loading?.value ?? false)
  const interactive = computed(() => !disabled.value && !loading.value)
  const size = computed(() => options.size?.value ?? 'md')
  const variant = computed(() => options.variant?.value ?? 'solid')

  function pressStart() {
    if (!interactive.value) {
      return
    }

    pressed.value = true
  }

  function pressEnd() {
    pressed.value = false
  }

  function pressCancel() {
    pressed.value = false
  }

  function click(event?: Event) {
    if (interactive.value) {
      return true
    }

    event?.preventDefault?.()
    event?.stopPropagation?.()
    return false
  }

  return {
    state: {
      disabled,
      interactive,
      loading,
      pressed,
      size,
      variant
    },
    attrs: {
      root: {
        type: 'button'
      }
    },
    events: {
      pressStart,
      pressEnd,
      pressCancel,
      click
    }
  }
}
