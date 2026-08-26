import { computed, defineComponent, h, type PropType } from 'vue'

export interface StepItem {
  description?: string
  disabled?: boolean
  icon?: string
  title: string
}

export type StepsDirection = 'horizontal' | 'vertical'
export type StepStatus = 'pending' | 'current' | 'completed'

export const VSteps = defineComponent({
  name: 'VSteps',
  props: {
    clickable: Boolean,
    current: {
      type: Number,
      default: 0
    },
    direction: {
      type: String as PropType<StepsDirection>,
      default: 'horizontal'
    },
    items: {
      type: Array as PropType<Array<StepItem | string>>,
      default: () => []
    }
  },
  emits: ['select', 'update:current'],
  setup(props, { attrs, emit, slots }) {
    const normalizedItems = computed<StepItem[]>(() =>
      props.items.map((item) => (typeof item === 'string' ? { title: item } : item))
    )

    function statusFor(index: number): StepStatus {
      if (index < props.current) return 'completed'
      if (index === props.current) return 'current'
      return 'pending'
    }

    function select(index: number, item: StepItem) {
      if (!props.clickable || item.disabled) return
      emit('update:current', index)
      emit('select', { index, item })
    }

    return () =>
      h(
        'ol',
        {
          ...attrs,
          class: ['varo-steps', attrs.class],
          'data-direction': props.direction
        },
        normalizedItems.value.map((item, index) =>
          h(
            'li',
            {
              key: `${index}-${item.title}`,
              class: 'varo-steps__item',
              'data-disabled': String(Boolean(item.disabled)),
              'data-status': statusFor(index)
            },
            [
              h(
                'button',
                {
                  class: 'varo-steps__trigger',
                  type: 'button',
                  disabled: item.disabled || !props.clickable,
                  'aria-current': statusFor(index) === 'current' ? 'step' : undefined,
                  onClick: () => select(index, item)
                },
                [
                  h('span', { class: 'varo-steps__marker', 'aria-hidden': 'true' }, item.icon ?? (index + 1)),
                  h('span', { class: 'varo-steps__body' }, [
                    h('span', { class: 'varo-steps__title' }, slots.title?.({ index, item }) ?? item.title),
                    item.description
                      ? h('span', { class: 'varo-steps__description' }, item.description)
                      : null
                  ])
                ]
              ),
              index < normalizedItems.value.length - 1 ? h('span', { class: 'varo-steps__line' }) : null
            ]
          )
        )
      )
  }
})
