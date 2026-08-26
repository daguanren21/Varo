import '../../styles/varo.css'
import { computed, defineComponent, h } from 'vue'

export const VSkeleton = defineComponent({
  name: 'VSkeleton',
  props: {
    animated: {
      type: Boolean,
      default: true
    },
    avatar: Boolean,
    loading: {
      type: Boolean,
      default: true
    },
    round: Boolean,
    rows: {
      type: Number,
      default: 3
    },
    title: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { attrs, slots }) {
    const rows = computed(() => Array.from({ length: Math.max(0, Math.floor(props.rows)) }, (_, index) => index))

    return () => {
      if (!props.loading) return slots.default?.() ?? null

      return h(
        'div',
        {
          ...attrs,
          class: ['varo-skeleton', attrs.class],
          'aria-busy': 'true',
          'aria-label': 'Loading',
          'data-animated': String(props.animated),
          'data-round': String(props.round)
        },
        [
          props.avatar ? h('span', { class: 'varo-skeleton__avatar' }) : null,
          h('div', { class: 'varo-skeleton__content' }, [
            props.title ? h('span', { class: 'varo-skeleton__title' }) : null,
            ...rows.value.map((row) =>
              h('span', {
                key: row,
                class: 'varo-skeleton__row',
                style: row === rows.value.length - 1 ? { width: '64%' } : undefined
              })
            )
          ])
        ]
      )
    }
  }
})
