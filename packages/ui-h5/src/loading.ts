import { defineComponent, h, type PropType } from 'vue'

export type VLoadingSize = 'sm' | 'md' | 'lg'
export type VLoadingTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'

export const VLoading = defineComponent({
  name: 'VLoading',
  props: {
    size: {
      type: String as PropType<VLoadingSize>,
      default: 'md'
    },
    tone: {
      type: String as PropType<VLoadingTone>,
      default: 'default'
    },
    text: {
      type: String,
      default: undefined
    }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'span',
        {
          ...attrs,
          class: ['varo-loading', attrs.class],
          'data-size': props.size,
          'data-tone': props.tone
        },
        [
          h('span', { class: 'varo-loading__spinner', 'aria-hidden': 'true' }),
          props.text || slots.default ? h('span', { class: 'varo-loading__text' }, slots.default?.() ?? props.text) : null
        ]
      )
  }
})
