import { computed, defineComponent, h, type PropType } from 'vue'
import { VIcon } from './icon'

export type NoticeBarTone = 'info' | 'success' | 'warning' | 'danger'

export const VNoticeBar = defineComponent({
  name: 'VNoticeBar',
  props: {
    closeable: Boolean,
    icon: {
      type: String,
      default: 'info'
    },
    scrollable: Boolean,
    text: String,
    tone: {
      type: String as PropType<NoticeBarTone>,
      default: 'warning'
    },
    visible: {
      type: Boolean,
      default: true
    },
    wrapable: Boolean
  },
  emits: ['close', 'update:visible'],
  setup(props, { attrs, emit, slots }) {
    const contentClass = computed(() => [
      'varo-notice-bar__content',
      props.scrollable && !props.wrapable && 'varo-notice-bar__content--scrolling'
    ])

    function close(event: MouseEvent) {
      emit('update:visible', false)
      emit('close', event)
    }

    return () =>
      props.visible
        ? h(
            'div',
            {
              ...attrs,
              class: ['varo-notice-bar', attrs.class],
              role: 'status',
              'data-scrollable': String(props.scrollable),
              'data-tone': props.tone,
              'data-wrapable': String(props.wrapable)
            },
            [
              slots.icon?.() ?? h(VIcon, { class: 'varo-notice-bar__icon', name: props.icon, size: 16 }),
              h('div', { class: 'varo-notice-bar__viewport' }, [
                h('div', { class: contentClass.value }, slots.default?.() ?? props.text)
              ]),
              slots.action?.() ??
                (props.closeable
                  ? h(
                      'button',
                      {
                        class: 'varo-notice-bar__close',
                        type: 'button',
                        'aria-label': 'Close notice',
                        onClick: close
                      },
                      [h(VIcon, { name: 'close', size: 14 })]
                    )
                  : null)
            ]
          )
        : null
  }
})
