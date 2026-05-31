import { resolveReactiveRuntime } from '../reactive'
import type { PressableRootOptions, UsePressableRootResult } from './types'

export function usePressableRoot(options: PressableRootOptions = {}): UsePressableRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const pressed = runtime.ref(false)
  const disabled = runtime.computed(() => options.disabled?.value ?? false)
  const loading = runtime.computed(() => options.loading?.value ?? false)
  const interactive = runtime.computed(() => !disabled.value && !loading.value)
  const size = runtime.computed(() => options.size?.value ?? 'md')
  const variant = runtime.computed(() => options.variant?.value ?? 'solid')

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
