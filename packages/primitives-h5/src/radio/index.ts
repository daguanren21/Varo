import type { RadioValue, UseRadioGroupResult } from '@varo-ui/headless'
import type { PropType } from 'vue'
import {

  useRadioGroup,

} from '@varo-ui/headless'
import { defineComponent, h, inject, onMounted, provide, shallowRef, toRef, watch } from 'vue'
import { buttonKeyboardAttrs, callHandler, runInteractiveClick, usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export { useRadioGroup } from './hooks'
export type * from './types'
export type { RadioValue } from '@varo-ui/headless'

const radioGroupContextKey = Symbol('varo-radio-group')
const radioItemContextKey = Symbol('varo-radio-item')

interface RadioItemContext {
  readonly disabled: boolean
  readonly value: RadioValue
}

function useRadioGroupContext() {
  const context = inject<UseRadioGroupResult | undefined>(radioGroupContextKey, undefined)
  if (!context) { throw new Error('RadioItem must be used within RadioGroup.') }
  return context
}

function useRadioItemContext() {
  const context = inject<RadioItemContext | undefined>(radioItemContextKey, undefined)
  if (!context) { throw new Error('RadioIndicator must be used within RadioItem.') }
  return context
}

export const RadioGroup = defineComponent({
  name: 'RadioGroup',
  inheritAttrs: false,
  props: {
    as: {
      type: String,
      default: 'div',
    },
    defaultValue: {
      type: [String, Number, Boolean] as PropType<RadioValue | undefined>,
      default: undefined,
    },
    disabled: Boolean,
    value: {
      type: [String, Number, Boolean] as PropType<RadioValue | undefined>,
      default: undefined,
    },
  },
  emits: ['update:value', 'valueChange'],
  setup(props, { attrs, emit, slots }) {
    const valueControlled = usePropPresence('value')
    const radio = useRadioGroup({
      valueControlled,
      runtime: vueReactiveRuntime,
      defaultValue: props.defaultValue,
      disabled: toRef(props, 'disabled'),
      value: toRef(props, 'value'),
      onValueChange(value) {
        emit('update:value', value)
        emit('valueChange', value)
      },
    })

    provide(radioGroupContextKey, radio)

    const root = shallowRef<HTMLElement | null>(null)
    function items() {
      return Array.from(root.value?.querySelectorAll<HTMLElement>('[role="radio"]') ?? []).filter(
        item => item.closest('[role="radiogroup"]') === root.value,
      )
    }
    function syncTabStops() {
      const radios = items()
      const enabled = radios.filter(item => item.getAttribute('aria-disabled') !== 'true' && !item.hasAttribute('disabled'))
      const tabbable = enabled.find(item => item.getAttribute('aria-checked') === 'true') ?? enabled[0]
      for (const item of radios) {
        item.tabIndex = !props.disabled && item === tabbable ? 0 : -1
      }
    }
    onMounted(syncTabStops)
    watch(root, (element, _previous, onCleanup) => {
      if (!element) { return }
      syncTabStops()
      const observer = new MutationObserver(syncTabStops)
      observer.observe(element, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['role', 'aria-checked', 'aria-disabled', 'disabled'],
      })
      onCleanup(() => observer.disconnect())
    }, { flush: 'post' })
    watch(() => props.disabled, syncTabStops, { flush: 'post' })
    function onKeydown(event: KeyboardEvent) {
      callHandler(attrs.onKeydown, event)
      if (event.defaultPrevented || props.disabled) { return }
      const current = event.target as HTMLElement
      if (current.getAttribute('role') !== 'radio' || current.closest('[role="radiogroup"]') !== root.value) { return }
      const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown'
      const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp'
      if (!forward && !backward) { return }
      const enabled = items().filter(item => item.getAttribute('aria-disabled') !== 'true' && !item.hasAttribute('disabled'))
      const index = enabled.indexOf(current)
      if (index < 0) { return }
      event.preventDefault()
      const next = enabled[(index + (forward ? 1 : -1) + enabled.length) % enabled.length]
      next.focus()
      next.click()
    }

    return () => h(props.as, { ...attrs, ...radio.attrs.root, ref: root, onKeydown }, slots.default?.())
  },
})

export const RadioItem = defineComponent({
  name: 'RadioItem',
  inheritAttrs: false,
  props: {
    as: {
      type: String,
      default: 'button',
    },
    disabled: Boolean,
    value: {
      type: [String, Number, Boolean] as PropType<RadioValue>,
      required: true,
    },
  },
  setup(props, { attrs, slots }) {
    const radio = useRadioGroupContext()
    provide(radioItemContextKey, {
      get disabled() {
        return props.disabled
      },
      get value() {
        return props.value
      },
    })

    return () =>
      h(
        props.as,
        {
          ...attrs,
          ...buttonKeyboardAttrs(props.as, attrs, !props.disabled && radio.state.interactive.value),
          ...radio.api.getItemAttrs(props.value, props.disabled),
          disabled: props.as === 'button' ? props.disabled || radio.state.disabled.value : undefined,
          type: props.as === 'button' ? attrs.type ?? 'button' : undefined,
          onClick: (event: MouseEvent) => {
            runInteractiveClick(event, {
              action: () => radio.events.select(props.value),
              handler: attrs.onClick,
              interactive: !props.disabled && radio.state.interactive.value,
            })
          },
        },
        slots.default?.(),
      )
  },
})

export const RadioIndicator = defineComponent({
  name: 'RadioIndicator',
  props: {
    as: {
      type: String,
      default: 'span',
    },
  },
  setup(props, { attrs, slots }) {
    const radio = useRadioGroupContext()
    const item = useRadioItemContext()

    return () =>
      radio.state.value.value === item.value
        ? h(props.as, { ...attrs, ...radio.api.getIndicatorAttrs(item.value) }, slots.default?.())
        : null
  },
})
