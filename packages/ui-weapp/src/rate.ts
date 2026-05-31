import { computed, defineComponent, h } from 'vue'
import { createVariantClass } from '@varo/shared'
import { useVaroTheme } from '@varo/theme'

export const VRate = defineComponent({
  name: 'VRate',
  props: {
    allowClear: {
      type: Boolean,
      default: true
    },
    count: {
      type: Number,
      default: 5
    },
    disabled: Boolean,
    readonly: Boolean,
    value: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:value', 'change'],
  setup(props, { attrs, emit, slots }) {
    const theme = useVaroTheme()
    const classes = computed(() =>
      createVariantClass('varo-rate', {
        radius: theme.value.components.button.borderRadius,
        disabled: props.disabled,
        readonly: props.readonly
      })
    )

    function update(next: number) {
      if (props.disabled || props.readonly) return
      const value = props.allowClear && props.value === next ? 0 : next
      emit('update:value', value)
      emit('change', value)
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: [classes.value, attrs.class],
          role: 'radiogroup',
          'data-disabled': String(props.disabled),
          'data-readonly': String(props.readonly)
        },
        Array.from({ length: props.count }, (_, index) => {
          const value = index + 1
          const active = value <= props.value
          return h(
            'button',
            {
              class: 'varo-rate__item',
              type: 'button',
              role: 'radio',
              'aria-checked': String(active),
              'data-active': String(active),
              disabled: props.disabled,
              onClick: () => update(value)
            },
            slots.icon?.({ active, value }) ?? (active ? '★' : '☆')
          )
        })
      )
  }
})
