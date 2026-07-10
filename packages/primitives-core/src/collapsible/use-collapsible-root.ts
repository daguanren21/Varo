import { resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type { CollapsibleRootOptions, UseCollapsibleRootResult } from './types'

export function useCollapsibleRoot(options: CollapsibleRootOptions = {}): UseCollapsibleRootResult {
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
      root: {
        get 'data-disabled'() {
          return String(disabled.value)
        },
        get 'data-state'() {
          return getState()
        }
      },
      trigger: {
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
        get 'data-state'() {
          return getState()
        }
      }
    },
    events: {
      close: () => setOpen(false),
      open: () => setOpen(true),
      toggle: () => setOpen(!openState.current.value)
    },
    api: {
      setOpen
    }
  }
}
