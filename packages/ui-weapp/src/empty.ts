import { defineComponent, h, type PropType } from 'vue'
import { VIcon } from './icon'
import { VImage } from './image'

export type EmptySize = 'sm' | 'md' | 'lg'

export const VEmpty = defineComponent({
  name: 'VEmpty',
  props: {
    description: {
      type: String,
      default: '暂无数据'
    },
    icon: {
      type: String,
      default: 'info'
    },
    image: String,
    size: {
      type: String as PropType<EmptySize>,
      default: 'md'
    },
    title: String
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'section',
        {
          ...attrs,
          class: ['varo-empty', attrs.class],
          role: 'status',
          'data-size': props.size
        },
        [
          h(
            'div',
            { class: 'varo-empty__visual', 'aria-hidden': 'true' },
            slots.image?.() ??
              (props.image
                ? [h(VImage, { alt: '', fit: 'contain', height: '100%', src: props.image, width: '100%' })]
                : [h(VIcon, { name: props.icon, size: props.size === 'lg' ? 44 : props.size === 'sm' ? 28 : 36 })])
          ),
          props.title || slots.title
            ? h('h3', { class: 'varo-empty__title' }, slots.title?.() ?? props.title)
            : null,
          h('p', { class: 'varo-empty__description' }, slots.description?.() ?? props.description),
          slots.default ? h('div', { class: 'varo-empty__action' }, slots.default()) : null
        ]
      )
  }
})
