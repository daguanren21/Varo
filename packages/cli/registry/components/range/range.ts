import { createVariantClass } from '@varo-ui/headless'
import { useVaroTheme } from '@varo-ui/theme'
import { computed, defineComponent, h } from 'vue'
import '../../styles/varo.css'

export const VRange = defineComponent({
  name: 'VRange',
  props: {
    disabled: Boolean,
    max: {
      type: Number,
      default: 100,
    },
    min: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 1,
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  emits: ['update:value', 'change'],
  setup(props, { attrs, emit }) {
    const theme = useVaroTheme()
    const currentValue = computed(() => Math.min(props.max, Math.max(props.min, props.value)))
    const percent = computed(() => {
      const total = props.max - props.min
      return total <= 0 ? 0 : ((currentValue.value - props.min) / total) * 100
    })
    const classes = computed(() =>
      createVariantClass('varo-range', {
        radius: theme.value.components.button.borderRadius,
        disabled: props.disabled,
      }),
    )

    function update(value: number) {
      const next = Math.min(props.max, Math.max(props.min, value))
      emit('update:value', next)
      emit('change', next)
    }

    return () =>
      h('div', { ...attrs, 'class': [classes.value, attrs.class], 'data-disabled': String(props.disabled) }, [
        h('div', { class: 'varo-range__track' }, [
          h('span', {
            class: 'varo-range__fill',
            style: { width: `${percent.value}%` },
          }),
        ]),
        h('input', {
          class: 'varo-range__input',
          disabled: props.disabled,
          max: props.max,
          min: props.min,
          step: props.step,
          type: 'range',
          value: String(currentValue.value),
          onInput: (event: Event) => update(Number((event.target as HTMLInputElement).value)),
        }),
      ])
  },
})
