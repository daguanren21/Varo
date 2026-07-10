import { resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type { PopupRootOptions, UsePopupRootResult } from './types'

export function usePopupRoot(options: PopupRootOptions = {}): UsePopupRootResult {
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
  const contentId = runtime.ref('varo-popup-content')

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
        'data-state': visibleState.current.value ? 'open' : 'closed'
      },
      overlay: {
        'aria-hidden': true,
        'data-state': visibleState.current.value ? 'open' : 'closed'
      },
      content: {
        id: contentId.value,
        role: 'dialog',
        tabindex: -1,
        'data-state': visibleState.current.value ? 'open' : 'closed'
      }
    },
    events: {
      open: () => setVisible(true),
      close,
      toggle: () => setVisible(!visibleState.current.value),
      onEscapeKeyDown: close,
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
