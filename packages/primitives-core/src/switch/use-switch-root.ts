import { resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type { SwitchRootOptions, UseSwitchRootResult } from './types'

export function useSwitchRoot(options: SwitchRootOptions = {}): UseSwitchRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const checkedState = useControllableState({
    controlled: options.checkedControlled,
    runtime,
    defaultValue: options.defaultChecked ?? false,
    value: options.checked,
    onUpdate: options.onCheckedChange
  })
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const loading = runtime.computed(() => options.loading?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value && !loading.value) as Ref<boolean>

  function setChecked(checked: boolean) {
    if (!interactive.value) {
      return false
    }

    checkedState.current.value = checked
    return true
  }

  function getState() {
    return checkedState.current.value ? 'checked' : 'unchecked'
  }

  return {
    state: {
      checked: checkedState.current,
      disabled,
      interactive,
      loading
    },
    attrs: {
      root: {
        role: 'switch',
        get 'aria-checked'() {
          return checkedState.current.value
        },
        get 'aria-disabled'() {
          return !interactive.value || undefined
        },
        get 'data-disabled'() {
          return String(disabled.value)
        },
        get 'data-loading'() {
          return String(loading.value)
        },
        get 'data-state'() {
          return getState()
        }
      },
      thumb: {
        'data-part': 'thumb',
        get 'data-state'() {
          return getState()
        }
      }
    },
    events: {
      toggle: () => setChecked(!checkedState.current.value)
    },
    api: {
      setChecked
    }
  }
}
