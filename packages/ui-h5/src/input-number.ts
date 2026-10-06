// Generated from registry/components/input-number/input-number.ts; edit the Registry source.
import type { PropType } from 'vue'
import { createVariantClass } from '@varo-ui/headless'
import { computed, defineComponent, h } from 'vue'
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from '@varo/primitives-h5'
import { VIcon } from './icon'
import './styles/varo.css'
import './styles/varo-icon.css'
import './styles/varo-input-number.css'

export const VInputNumber = defineComponent({
  name: 'VInputNumber',
  props: {
    decreaseAriaLabel: { type: String, default: 'Decrease value' },
    disabled: Boolean,
    increaseAriaLabel: { type: String, default: 'Increase value' },
    inputAriaLabel: { type: String, default: 'Numeric value' },
    max: { type: Number, default: Number.POSITIVE_INFINITY },
    min: { type: Number, default: Number.NEGATIVE_INFINITY },
    precision: { type: Number as PropType<number | undefined>, default: undefined },
    readonly: Boolean,
    step: { type: Number, default: 1 },
    value: { type: Number, default: 0 },
  },
  emits: ['update:value', 'change', 'blur', 'focus'],
  setup(props, { attrs, emit }) {
    const classes = computed(() =>
      createVariantClass('varo-input-number', { disabled: props.disabled, readonly: props.readonly }),
    )

    return () =>
      h(
        NumberFieldRoot,
        {
          ...attrs,
          'class': [classes.value, attrs.class],
          'disabled': props.disabled,
          'max': props.max,
          'min': props.min,
          'precision': props.precision,
          'readonly': props.readonly,
          'step': props.step,
          'value': props.value,
          'onUpdate:value': (value: number) => emit('update:value', value),
          'onValueChange': (value: number) => emit('change', value),
        },
        {
          default: () => [
            h(NumberFieldDecrement, { 'aria-label': props.decreaseAriaLabel, 'class': 'varo-input-number__minus' }, () => h(VIcon, { name: 'minus', size: 14 })),
            h(NumberFieldInput, {
              'class': 'varo-input-number__input',
              'aria-label': props.inputAriaLabel,
              'onBlur': (event: FocusEvent) => emit('blur', event),
              'onFocus': (event: FocusEvent) => emit('focus', event),
            }),
            h(NumberFieldIncrement, { 'aria-label': props.increaseAriaLabel, 'class': 'varo-input-number__plus' }, () => h(VIcon, { name: 'plus', size: 14 })),
          ],
        },
      )
  },
})
