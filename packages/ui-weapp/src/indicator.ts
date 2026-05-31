import { defineComponent, h, type PropType, type StyleValue } from 'vue'

export const VIndicator = defineComponent({
  name: 'VIndicator',
  props: {
    total: {
      type: Number,
      default: 0
    },
    current: {
      type: Number,
      default: 0
    },
    type: {
      type: String as PropType<'dot' | 'line'>,
      default: 'dot'
    }
  },
  emits: ['update:current', 'change'],
  setup(props, { attrs, emit }) {
    function setCurrent(index: number) {
      if (index === props.current) {
        return
      }

      emit('update:current', index)
      emit('change', index)
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['varo-indicator', attrs.class],
          style: attrs.style as StyleValue,
          'data-current': String(props.current),
          'data-total': String(props.total),
          'data-type': props.type
        },
        Array.from({ length: props.total }).map((_, index) =>
          h('button', {
            key: index,
            type: 'button',
            class: 'varo-indicator__item',
            'data-active': String(index === props.current),
            'aria-current': index === props.current ? 'true' : undefined,
            'aria-label': `切换到第 ${index + 1} 项`,
            onClick: () => setCurrent(index)
          })
        )
      )
  }
})
