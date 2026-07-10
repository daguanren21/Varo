import { readMaybeRef, resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type {
  TabsNavigationOptions,
  TabsOrientation,
  TabsRootOptions,
  TabsValue,
  UseTabsRootResult
} from './types'

let nextTabsRootId = 0

function encodeRootId(value: string) {
  return encodeURIComponent(value)
}

function encodeTabsValueId(value: TabsValue) {
  const prefix = typeof value === 'number' ? 'n' : 's'
  return `${prefix}-${encodeURIComponent(String(value))}`
}

function createTabsRootId() {
  nextTabsRootId += 1
  return `root-${nextTabsRootId}`
}

export function getTabsNavigationIndex(options: TabsNavigationOptions): number | undefined {
  const { currentIndex, itemCount, key, orientation } = options
  if (itemCount <= 0 || currentIndex < 0 || currentIndex >= itemCount) return undefined
  if (key === 'Home') return 0
  if (key === 'End') return itemCount - 1

  const previous =
    (orientation === 'horizontal' && key === 'ArrowLeft') ||
    (orientation === 'vertical' && key === 'ArrowUp')
  const next =
    (orientation === 'horizontal' && key === 'ArrowRight') ||
    (orientation === 'vertical' && key === 'ArrowDown')

  if (previous) return (currentIndex - 1 + itemCount) % itemCount
  if (next) return (currentIndex + 1) % itemCount
  return undefined
}

export function useTabsRoot(options: TabsRootOptions = {}): UseTabsRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const rootId = encodeRootId(
    (options.id === undefined ? undefined : readMaybeRef(options.id)) || createTabsRootId()
  )
  const valueState = useControllableState<TabsValue | undefined>({
    controlled: options.valueControlled,
    runtime,
    defaultValue: options.defaultValue,
    value: options.value,
    onUpdate: options.onValueChange
  })
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value) as Ref<boolean>
  const orientation = runtime.computed(() =>
    options.orientation === undefined ? 'horizontal' : readMaybeRef(options.orientation) ?? 'horizontal'
  ) as Ref<TabsOrientation>

  function isActive(value: TabsValue) {
    return valueState.current.value === value
  }

  function select(value: TabsValue) {
    if (!interactive.value || isActive(value)) {
      return false
    }

    valueState.current.value = value
    return true
  }

  function getTriggerId(value: TabsValue) {
    return `varo-tabs-${rootId}-trigger-${encodeTabsValueId(value)}`
  }

  function getContentId(value: TabsValue) {
    return `varo-tabs-${rootId}-content-${encodeTabsValueId(value)}`
  }

  function getTriggerAttrs(value: TabsValue, itemDisabled = false) {
    const active = isActive(value)
    const disabledValue = disabled.value || itemDisabled

    return {
      id: getTriggerId(value),
      role: 'tab',
      'aria-controls': getContentId(value),
      'aria-selected': active,
      'aria-disabled': disabledValue || undefined,
      'data-disabled': String(disabledValue),
      'data-state': active ? 'active' : 'inactive',
      'data-value': String(value),
      tabindex: active && !disabledValue ? 0 : -1
    }
  }

  function getContentAttrs(value: TabsValue) {
    const active = isActive(value)

    return {
      id: getContentId(value),
      role: 'tabpanel',
      'aria-labelledby': getTriggerId(value),
      'data-state': active ? 'active' : 'inactive',
      'data-value': String(value)
    }
  }

  return {
    state: {
      disabled,
      interactive,
      orientation,
      value: valueState.current
    },
    attrs: {
      root: {
        id: rootId,
        get 'data-disabled'() {
          return String(disabled.value)
        }
      },
      list: {
        role: 'tablist',
        get 'aria-orientation'() {
          return orientation.value
        }
      }
    },
    events: {
      select
    },
    api: {
      getContentAttrs,
      getTriggerAttrs,
      select
    }
  }
}
