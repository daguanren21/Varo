import { resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type { OverlayRootOptions, UseOverlayRootResult } from './types'

export function useOverlayRoot(options: OverlayRootOptions = {}): UseOverlayRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const visibleState = useControllableState({
    controlled: options.visibleControlled,
    runtime,
    defaultValue: options.defaultVisible ?? false,
    value: options.visible,
    onUpdate: options.onVisibleChange
  })

  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const closeOnClickOverlay = runtime.computed(() => options.closeOnClickOverlay?.value ?? true) as Ref<boolean>

  function setVisible(visible: boolean) {
    if (disabled.value) {
      return
    }

    visibleState.current.value = visible

    if (!visible) {
      options.onClose?.()
    }
  }

  function close() {
    setVisible(false)
  }

  return {
    state: {
      visible: visibleState.current,
      disabled,
      closeOnClickOverlay
    },
    attrs: {
      root: {
        'aria-hidden': true,
        'data-state': visibleState.current.value ? 'open' : 'closed'
      }
    },
    events: {
      open: () => setVisible(true),
      close,
      toggle: () => setVisible(!visibleState.current.value),
      onOverlayClick: () => {
        if (closeOnClickOverlay.value) {
          close()
        }
      }
    },
    api: {
      setVisible
    }
  }
}
