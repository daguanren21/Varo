import type { PropType, StyleValue } from 'vue'
import { computed, defineComponent, h, shallowRef } from 'vue'

export interface ElevatorGroup {
  title: string
  items?: Array<string | { text?: string, title?: string, value?: string | number }>
}

export const VElevator = defineComponent({
  name: 'VElevator',
  props: {
    activeIndex: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    defaultActiveIndex: String,
    indexes: {
      type: Array as PropType<ElevatorGroup[]>,
      default: () => [],
    },
  },
  emits: ['update:activeIndex', 'change', 'clickItem'],
  setup(props, { attrs, emit }) {
    const localActive = shallowRef(props.defaultActiveIndex ?? props.indexes[0]?.title ?? '')
    const current = computed(() => props.activeIndex ?? localActive.value)
    const groupRefs = new Map<string, HTMLElement>()

    function setActive(title: string) {
      if (props.activeIndex === undefined) {
        localActive.value = title
      }

      emit('update:activeIndex', title)
      emit('change', title)
      groupRefs.get(title)?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          'class': ['varo-elevator', attrs.class],
          'style': attrs.style as StyleValue,
          'data-active-index': current.value,
        },
        [
          h(
            'div',
            { class: 'varo-elevator__content' },
            props.indexes.map(group =>
              h(
                'section',
                {
                  'key': group.title,
                  'ref': (element) => {
                    if (element instanceof HTMLElement) {
                      groupRefs.set(group.title, element)
                    }
                    else {
                      groupRefs.delete(group.title)
                    }
                  },
                  'class': 'varo-elevator__group',
                  'data-active': String(current.value === group.title),
                  'data-index': group.title,
                },
                [
                  h('div', { class: 'varo-elevator__title' }, group.title),
                  ...(group.items ?? []).map((item, index) => {
                    const text = typeof item === 'string' ? item : item.text ?? item.title ?? String(item.value ?? '')
                    return h(
                      'button',
                      {
                        key: `${group.title}-${index}`,
                        type: 'button',
                        class: 'varo-elevator__item',
                        onClick: () => emit('clickItem', item, group.title),
                      },
                      text,
                    )
                  }),
                ],
              ),
            ),
          ),
          h(
            'div',
            { class: 'varo-elevator__indexes' },
            props.indexes.map(group =>
              h(
                'button',
                {
                  'key': group.title,
                  'type': 'button',
                  'class': 'varo-elevator__index',
                  'data-active': String(current.value === group.title),
                  'aria-pressed': String(current.value === group.title),
                  'onClick': () => setActive(group.title),
                },
                group.title,
              ),
            ),
          ),
        ],
      )
  },
})
