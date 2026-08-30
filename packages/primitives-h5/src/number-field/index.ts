import type { UseNumberFieldRootResult } from '@varo-ui/headless'
import type { PropType } from 'vue'
import { useNumberFieldRoot } from '@varo-ui/headless'
import { defineComponent, h, inject, provide, toRef } from 'vue'
import { usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

const numberFieldRootContextKey = Symbol('varo-number-field-root')

function useNumberFieldContext() {
  const context = inject<UseNumberFieldRootResult | undefined>(numberFieldRootContextKey, undefined)
  if (!context) { throw new Error('Number field parts must be used within NumberFieldRoot.') }
  return context
}

function callHandler(handler: unknown, event: Event) {
  if (typeof handler === 'function') { handler(event) }
}

function eventValue(event: Event) {
  const target = event.target as HTMLInputElement | null
  return Number(target?.value)
}

export const NumberFieldRoot = defineComponent({
  name: 'NumberFieldRoot',
  props: {
    as: { type: String, default: 'div' },
    defaultValue: { type: Number, default: 0 },
    disabled: Boolean,
    max: { type: Number, default: Number.POSITIVE_INFINITY },
    min: { type: Number, default: Number.NEGATIVE_INFINITY },
    precision: { type: Number as PropType<number | undefined>, default: undefined },
    readonly: Boolean,
    step: { type: Number, default: 1 },
    value: { type: Number as PropType<number | undefined>, default: undefined },
  },
  emits: ['update:value', 'valueChange'],
  setup(props, { attrs, emit, slots }) {
    const numberField = useNumberFieldRoot({
      valueControlled: usePropPresence('value'),
      runtime: vueReactiveRuntime,
      defaultValue: props.defaultValue,
      disabled: toRef(props, 'disabled'),
      max: toRef(props, 'max'),
      min: toRef(props, 'min'),
      precision: toRef(props, 'precision'),
      readonly: toRef(props, 'readonly'),
      step: toRef(props, 'step'),
      value: toRef(props, 'value'),
      onValueChange(value) {
        emit('update:value', value)
        emit('valueChange', value)
      },
    })

    provide(numberFieldRootContextKey, numberField)
    return () => h(props.as, { ...attrs, ...numberField.attrs.root }, slots.default?.({ value: numberField.state.value.value }))
  },
})

export const NumberFieldDecrement = defineComponent({
  name: 'NumberFieldDecrement',
  setup(_props, { attrs, slots }) {
    const numberField = useNumberFieldContext()
    return () => {
      const { onClick, ...restAttrs } = attrs
      return h('button', {
        ...restAttrs,
        ...numberField.attrs.decrement,
        type: 'button',
        onClick: (event: MouseEvent) => {
          if (numberField.events.decrement()) { callHandler(onClick, event) }
        },
      }, slots.default?.())
    }
  },
})

export const NumberFieldInput = defineComponent({
  name: 'NumberFieldInput',
  setup(_props, { attrs }) {
    const numberField = useNumberFieldContext()
    return () => {
      const { onBlur, onFocus, onInput, ...restAttrs } = attrs
      return h('input', {
        ...restAttrs,
        ...numberField.attrs.input,
        disabled: numberField.state.disabled.value || undefined,
        readonly: numberField.state.readonly.value || undefined,
        type: 'number',
        value: String(numberField.state.value.value),
        onBlur: (event: FocusEvent) => {
          numberField.events.input(eventValue(event))
          callHandler(onBlur, event)
        },
        onFocus: (event: FocusEvent) => callHandler(onFocus, event),
        onInput: (event: Event) => {
          numberField.events.input(eventValue(event))
          callHandler(onInput, event)
        },
      })
    }
  },
})

export const NumberFieldIncrement = defineComponent({
  name: 'NumberFieldIncrement',
  setup(_props, { attrs, slots }) {
    const numberField = useNumberFieldContext()
    return () => {
      const { onClick, ...restAttrs } = attrs
      return h('button', {
        ...restAttrs,
        ...numberField.attrs.increment,
        type: 'button',
        onClick: (event: MouseEvent) => {
          if (numberField.events.increment()) { callHandler(onClick, event) }
        },
      }, slots.default?.())
    }
  },
})

export { useNumberFieldRoot } from '@varo-ui/headless'
