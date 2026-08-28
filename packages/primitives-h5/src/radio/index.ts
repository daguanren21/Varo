import type { RadioValue, UseRadioGroupResult } from '@varo-ui/headless'
import type { PropType } from 'vue'
import {

  useRadioGroup,

} from '@varo-ui/headless'
import { defineComponent, h, inject, provide, toRef } from 'vue'
import { runInteractiveClick, usePropPresence } from '../vue-control'
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

    return () => h(props.as, { ...attrs, ...radio.attrs.root }, slots.default?.())
  },
})

export const RadioItem = defineComponent({
  name: 'RadioItem',
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
