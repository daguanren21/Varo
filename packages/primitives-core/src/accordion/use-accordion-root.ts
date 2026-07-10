import { readMaybeRef, resolveReactiveRuntime, type Ref } from '../reactive'
import { useControllableState } from '../use-controllable-state'
import type {
  AccordionRootOptions,
  AccordionType,
  AccordionValue,
  UseAccordionRootResult
} from './types'

function encodeId(value: string) {
  return encodeURIComponent(value)
}

let nextAccordionRootId = 0

function createAccordionRootId() {
  nextAccordionRootId += 1
  return `root-${nextAccordionRootId}`
}

export function useAccordionRoot(options: AccordionRootOptions = {}): UseAccordionRootResult {
  const runtime = resolveReactiveRuntime(options.runtime)
  const rootId = encodeId(
    (options.id === undefined ? undefined : readMaybeRef(options.id)) || createAccordionRootId()
  )
  const type = runtime.computed(() =>
    options.type === undefined ? 'single' : readMaybeRef(options.type) ?? 'single'
  ) as Ref<AccordionType>
  const collapsible = runtime.computed(() =>
    options.collapsible === undefined ? false : readMaybeRef(options.collapsible) ?? false
  ) as Ref<boolean>
  const initialValue = options.defaultValue ?? (type.value === 'multiple' ? [] : undefined)
  const valueState = useControllableState<AccordionValue>({
    controlled: options.valueControlled,
    runtime,
    defaultValue: initialValue,
    value: options.value,
    onUpdate: options.onValueChange
  })
  const disabled = runtime.computed(() => options.disabled?.value ?? false) as Ref<boolean>
  const interactive = runtime.computed(() => !disabled.value) as Ref<boolean>

  function isOpen(value: string) {
    const current = valueState.current.value
    return type.value === 'multiple'
      ? Array.isArray(current) && current.includes(value)
      : current === value
  }

  function toggle(value: string, itemDisabled = false) {
    if (!interactive.value || itemDisabled) {
      return false
    }

    if (type.value === 'multiple') {
      const current = Array.isArray(valueState.current.value) ? valueState.current.value : []
      valueState.current.value = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      return true
    }

    if (isOpen(value)) {
      if (!collapsible.value) {
        return false
      }

      valueState.current.value = undefined
      return true
    }

    valueState.current.value = value
    return true
  }

  function getState(value: string) {
    return isOpen(value) ? 'open' : 'closed'
  }

  function getContentId(value: string) {
    return `varo-accordion-${rootId}-content-${encodeId(value)}`
  }

  function getTriggerId(value: string) {
    return `varo-accordion-${rootId}-trigger-${encodeId(value)}`
  }

  function getItemAttrs(value: string, itemDisabled = false) {
    const disabledValue = disabled.value || itemDisabled

    return {
      'data-disabled': String(disabledValue),
      'data-state': getState(value),
      'data-value': value
    }
  }

  function getTriggerAttrs(value: string, itemDisabled = false) {
    const disabledValue = disabled.value || itemDisabled

    return {
      id: getTriggerId(value),
      'aria-controls': getContentId(value),
      'aria-disabled': disabledValue || undefined,
      'aria-expanded': isOpen(value),
      'data-disabled': String(disabledValue),
      'data-state': getState(value),
      'data-value': value
    }
  }

  function getContentAttrs(value: string) {
    return {
      id: getContentId(value),
      role: 'region',
      'aria-labelledby': getTriggerId(value),
      'data-state': getState(value),
      'data-value': value
    }
  }

  return {
    state: {
      collapsible,
      disabled,
      interactive,
      type,
      value: valueState.current
    },
    attrs: {
      root: {
        id: rootId,
        get 'data-disabled'() {
          return String(disabled.value)
        },
        get 'data-type'() {
          return type.value
        }
      }
    },
    events: {
      toggle
    },
    api: {
      getContentAttrs,
      getItemAttrs,
      getTriggerAttrs,
      isOpen,
      toggle
    }
  }
}
