import { createSelectDisplay, toggleSelectValue } from '@varo/shared'
import { resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type { SelectOption, SelectRootOptions, SelectValue, UseSelectRootResult } from './types'

export function useSelectRoot(options: SelectRootOptions = {}): UseSelectRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const openState = useControllableState({
    controlled: options.openControlled,
    runtime,
    defaultValue: options.defaultOpen ?? false,
    value: options.open,
    onUpdate: options.onOpenChange
  })
  const valueState = useControllableState<SelectValue>({
    controlled: options.valueControlled,
    runtime,
    defaultValue: options.defaultValue,
    value: options.value,
    onUpdate: options.onValueChange
  })
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const multiple = runtime.computed(() => options.multiple?.value ?? false) as Ref<boolean>
  const readonly = runtime.computed(() => options.readonly?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value && !readonly.value) as Ref<boolean>
  const selectOptions = runtime.computed(() => options.options?.value ?? []) as Ref<readonly SelectOption[]>
  const placeholder = runtime.computed(() => options.placeholder?.value ?? '请选择') as Ref<string>
  const displayValue = runtime.computed(() =>
    createSelectDisplay([...selectOptions.value], valueState.current.value, placeholder.value)
  ) as Ref<string>

  function setOpen(open: boolean) {
    if (!interactive.value) {
      return
    }

    openState.current.value = open
  }

  function setValue(value: SelectValue) {
    if (!interactive.value) {
      return false
    }

    valueState.current.value = value
    return true
  }

  function getItemSelected(option: SelectOption) {
    const current = valueState.current.value
    return Array.isArray(current) ? current.includes(option.value) : current === option.value
  }

  function hasValue(value: SelectValue) {
    return Array.isArray(value) ? value.length > 0 : value !== undefined
  }

  function getItemAttrs(option: SelectOption) {
    const selected = getItemSelected(option)

    return {
      role: 'option',
      'aria-disabled': option.disabled || undefined,
      'aria-selected': selected,
      'data-disabled': String(Boolean(option.disabled)),
      'data-state': selected ? 'checked' : 'unchecked',
      'data-value': String(option.value)
    }
  }

  function getGroupAttrs() {
    return {
      role: 'group'
    }
  }

  function select(option: SelectOption) {
    const result = toggleSelectValue(valueState.current.value, option, {
      multiple: multiple.value
    })

    if (!result.changed || result.limited) {
      return false
    }

    const changed = setValue(result.value)
    if (changed && !multiple.value) {
      setOpen(false)
    }

    return changed
  }

  return {
    state: {
      disabled,
      displayValue,
      interactive,
      multiple,
      open: openState.current,
      options: selectOptions,
      placeholder,
      readonly,
      value: valueState.current
    },
    attrs: {
      trigger: {
        get 'aria-expanded'() {
          return openState.current.value
        },
        get 'data-disabled'() {
          return String(disabled.value)
        },
        get 'data-readonly'() {
          return String(readonly.value)
        },
        get 'data-state'() {
          return openState.current.value ? 'open' : 'closed'
        }
      },
      value: {
        get 'data-placeholder'() {
          return String(!hasValue(valueState.current.value))
        }
      },
      content: {
        role: 'listbox',
        get 'data-state'() {
          return openState.current.value ? 'open' : 'closed'
        }
      },
      group: {
        role: 'group'
      },
      label: {
        'data-part': 'label'
      }
    },
    events: {
      close: () => setOpen(false),
      open: () => setOpen(true),
      select,
      toggle: () => setOpen(!openState.current.value)
    },
    api: {
      getItemAttrs,
      getGroupAttrs,
      setOpen,
      setValue
    }
  }
}
