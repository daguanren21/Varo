import type { PropType } from 'vue'
import { useVaroTheme } from '@varo-ui/theme'
import { createVariantClass } from '@varo/shared'
import { computed, defineComponent, h } from 'vue'

export const VInputNumber = defineComponent({
  name: 'VInputNumber',
  props: {
    disabled: Boolean,
    max: {
      type: Number,
      default: Number.POSITIVE_INFINITY,
    },
    min: {
      type: Number,
      default: Number.NEGATIVE_INFINITY,
    },
    precision: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    readonly: Boolean,
    step: {
      type: Number,
      default: 1,
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:value', 'change', 'blur', 'focus'],
  setup(props, { attrs, emit }) {
    const theme = useVaroTheme()
    const currentValue = computed(() => clamp(props.value))
    const canMinus = computed(() => !props.disabled && !props.readonly && currentValue.value > props.min)
    const canPlus = computed(() => !props.disabled && !props.readonly && currentValue.value < props.max)
    const classes = computed(() =>
      createVariantClass('varo-input-number', {
        radius: theme.value.components.button.borderRadius,
        disabled: props.disabled,
        readonly: props.readonly,
      }),
    )

    function clamp(value: number) {
      const bounded = Math.min(props.max, Math.max(props.min, Number.isFinite(value) ? value : props.min))
      return props.precision === undefined ? bounded : Number(bounded.toFixed(props.precision))
    }

    function update(value: number) {
      const next = clamp(value)
      emit('update:value', next)
      emit('change', next)
    }

    return () =>
      h('div', { ...attrs, 'class': [classes.value, attrs.class], 'data-disabled': String(props.disabled) }, [
        h(
          'button',
          {
            class: 'varo-input-number__minus',
            type: 'button',
            disabled: !canMinus.value,
            onClick: () => update(currentValue.value - props.step),
          },
          '-',
        ),
        h('input', {
          class: 'varo-input-number__input',
          disabled: props.disabled,
          readonly: props.readonly,
          type: 'number',
          value: String(currentValue.value),
          onBlur: (event: FocusEvent) => emit('blur', event),
          onFocus: (event: FocusEvent) => emit('focus', event),
          onInput: (event: Event) => update(Number((event.target as HTMLInputElement).value)),
        }),
        h(
          'button',
          {
            class: 'varo-input-number__plus',
            type: 'button',
            disabled: !canPlus.value,
            onClick: () => update(currentValue.value + props.step),
          },
          '+',
        ),
      ])
  },
})
