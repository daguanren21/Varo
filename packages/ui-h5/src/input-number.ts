import type { PropType } from 'vue'
import { useVaroTheme } from '@varo-ui/theme'
import {
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldRoot,
} from '@varo/primitives-h5'
import { createVariantClass } from '@varo/shared'
import { computed, defineComponent, h } from 'vue'

export const VInputNumber = defineComponent({
  name: 'VInputNumber',
  props: {
    disabled: Boolean,
    max: { type: Number, default: Number.POSITIVE_INFINITY },
    min: { type: Number, default: Number.NEGATIVE_INFINITY },
    precision: { type: Number as PropType<number | undefined>, default: undefined },
    readonly: Boolean,
    step: { type: Number, default: 1 },
    value: { type: Number, default: 0 },
  },
  emits: ['update:value', 'change', 'blur', 'focus'],
  setup(props, { attrs, emit }) {
    const theme = useVaroTheme()
    const classes = computed(() =>
      createVariantClass('varo-input-number', {
        radius: theme.value.components.button.borderRadius,
        disabled: props.disabled,
        readonly: props.readonly,
      }),
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
            h(NumberFieldDecrement, { class: 'varo-input-number__minus' }, () => '-'),
            h(NumberFieldInput, {
              class: 'varo-input-number__input',
              onBlur: (event: FocusEvent) => emit('blur', event),
              onFocus: (event: FocusEvent) => emit('focus', event),
            }),
            h(NumberFieldIncrement, { class: 'varo-input-number__plus' }, () => '+'),
          ],
        },
      )
  },
})
