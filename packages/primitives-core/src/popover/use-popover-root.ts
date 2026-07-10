import { resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type { PopoverRootOptions, UsePopoverRootResult } from './types'

export function usePopoverRoot(options: PopoverRootOptions = {}): UsePopoverRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const openState = useControllableState({
    controlled: options.openControlled,
    runtime,
    defaultValue: options.defaultOpen ?? false,
    value: options.open,
    onUpdate: options.onOpenChange
  })
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value) as Ref<boolean>

  function setOpen(open: boolean) {
    if (!interactive.value || openState.current.value === open) {
      return false
    }

    openState.current.value = open
    return true
  }

  function getState() {
    return openState.current.value ? 'open' : 'closed'
  }

  return {
    state: {
      disabled,
      interactive,
      open: openState.current
    },
    attrs: {
      trigger: {
        'aria-haspopup': 'dialog',
        get 'aria-expanded'() {
          return openState.current.value
        },
        get 'aria-disabled'() {
          return disabled.value || undefined
        },
        get 'data-disabled'() {
          return String(disabled.value)
        },
        get 'data-state'() {
          return getState()
        }
      },
      content: {
        role: 'dialog',
        get 'data-state'() {
          return getState()
        }
      },
      close: {
        'data-part': 'close',
        get 'data-state'() {
          return getState()
        }
      }
    },
    events: {
      close: () => setOpen(false),
      onEscapeKeyDown: () => setOpen(false),
      onInteractOutside: () => setOpen(false),
      open: () => setOpen(true),
      toggle: () => setOpen(!openState.current.value)
    },
    api: {
      setOpen
    }
  }
}
