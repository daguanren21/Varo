import type { Ref } from '../reactive'
import type {
  DialogOpenChangeDetails,
  DialogOpenChangeReason,
  DialogRootOptions,
  UseDialogRootResult,
} from './types'
import { resolveReactiveRuntime } from '../reactive'
import { useControllableState } from '../use-controllable-state'

export function useDialogRoot(options: DialogRootOptions = {}): UseDialogRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const openState = useControllableState({
    controlled: options.openControlled,
    runtime,
    defaultValue: options.defaultOpen ?? false,
    value: options.open,
  })

  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const rootId = options.id ?? 'varo-dialog'
  const triggerId = `${rootId}-trigger`
  const contentId = `${rootId}-content`
  function setOpen(value: boolean, reason: DialogOpenChangeReason = 'imperative-action') {
    if (disabled.value || value === openState.current.value) {
      return
    }

    if (options.onOpenChange) {
      let cancellable = true
      let canceled = false
      const details: DialogOpenChangeDetails = {
        get reason() {
          return reason
        },
        get canceled() {
          return canceled
        },
        cancel() {
          if (cancellable) {
            canceled = true
          }
        },
      }
      try {
        options.onOpenChange(value, details)
      }
      finally {
        cancellable = false
      }
      if (details.canceled) {
        return
      }
    }

    openState.current.value = value
  }

  return {
    state: {
      open: openState.current,
      disabled,
    },
    attrs: {
      trigger: {
        'id': triggerId,
        'aria-controls': contentId,
        'aria-haspopup': 'dialog',
        get 'aria-disabled'() {
          return disabled.value || undefined
        },
        get 'aria-expanded'() {
          return openState.current.value
        },
        get 'data-state'() {
          return openState.current.value ? 'open' : 'closed'
        },
      },
      overlay: {
        'aria-hidden': true,
        get 'data-state'() {
          return openState.current.value ? 'open' : 'closed'
        },
      },
      content: {
        'id': contentId,
        'role': 'dialog',
        'tabindex': -1,
        'aria-labelledby': triggerId,
        'aria-modal': true,
        get 'data-state'() {
          return openState.current.value ? 'open' : 'closed'
        },
      },
    },
    events: {
      open: () => setOpen(true, 'trigger-press'),
      close: () => setOpen(false, 'close-press'),
      toggle: () => setOpen(!openState.current.value, 'trigger-press'),
      onEscapeKeyDown: () => setOpen(false, 'escape-key'),
      onOverlayClick: () => setOpen(false, 'outside-press'),
    },
    api: {
      setOpen,
    },
  }
}
