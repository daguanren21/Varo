import type { PropType, StyleValue } from 'vue'
import { defineComponent, h } from 'vue'
import '../../styles/varo.css'

export const VIndicator = defineComponent({
  name: 'VIndicator',
  props: {
    ariaLabel: {
      type: String,
      default: '轮播进度',
    },
    itemAriaLabel: {
      type: String,
      default: '第 {index} 项，共 {total} 项',
    },
    total: {
      type: Number,
      default: 0,
    },
    current: {
      type: Number,
      default: 0,
    },
    type: {
      type: String as PropType<'dot' | 'line'>,
      default: 'dot',
    },
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

    function itemLabel(index: number) {
      return props.itemAriaLabel
        .replaceAll('{index}', String(index + 1))
        .replaceAll('{total}', String(props.total))
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': ['varo-indicator', attrs.class],
          'style': attrs.style as StyleValue,
          'role': 'navigation',
          'aria-label': props.ariaLabel,
          'data-current': String(props.current),
          'data-total': String(props.total),
          'data-type': props.type,
        },
        Array.from({ length: props.total }).map((_, index) =>
          h('button', {
            'key': index,
            'type': 'button',
            'class': 'varo-indicator__item',
            'data-active': String(index === props.current),
            'aria-current': index === props.current ? 'true' : undefined,
            'aria-label': itemLabel(index),
            'onClick': () => setCurrent(index),
          }),
        ),
      )
  },
})
