import { computed, defineComponent, h, type PropType } from 'vue'

export type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'danger'
export type BadgeVariant = 'solid' | 'soft' | 'outline'

export const VBadge = defineComponent({
  name: 'VBadge',
  props: {
    content: {
      type: [Number, String],
      default: undefined
    },
    dot: Boolean,
    max: {
      type: Number,
      default: 99
    },
    showZero: Boolean,
    tone: {
      type: String as PropType<BadgeTone>,
      default: 'danger'
    },
    variant: {
      type: String as PropType<BadgeVariant>,
      default: 'solid'
    }
  },
  setup(props, { attrs, slots }) {
    const displayContent = computed(() => {
      if (props.dot) return ''
      if (typeof props.content === 'number' && props.content > props.max) return `${props.max}+`
      return props.content
    })
    const visible = computed(() =>
      props.dot || displayContent.value === undefined || displayContent.value === null
        ? props.dot || Boolean(slots.default)
        : props.showZero || displayContent.value !== 0
    )

    return () =>
      visible.value
        ? h(
            'span',
            {
              ...attrs,
              class: ['varo-badge', attrs.class],
              role: 'status',
              'data-dot': String(props.dot),
              'data-tone': props.tone,
              'data-variant': props.variant
            },
            slots.default?.() ?? displayContent.value
          )
        : null
  }
})
