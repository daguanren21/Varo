import type { PropType } from 'vue'
import { defineComponent, h, Transition } from 'vue'

export type VToastPosition = 'top' | 'middle' | 'bottom'
export type VToastType = 'text' | 'success' | 'warning' | 'danger' | 'loading'

function renderToastIcon(type: VToastType) {
  const common = {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': 1.8,
    'viewBox': '0 0 24 24',
  }
  const icon = type === 'success'
    ? [h('circle', { cx: 12, cy: 12, r: 8.5 }), h('path', { d: 'm8.5 12.2 2.3 2.3 4.8-5' })]
    : type === 'warning'
      ? [h('path', { d: 'M12 3.5 21 20H3z' }), h('path', { d: 'M12 9v4.5 M12 17h.01' })]
      : type === 'danger'
        ? [h('circle', { cx: 12, cy: 12, r: 8.5 }), h('path', { d: 'm9 9 6 6 M15 9l-6 6' })]
        : type === 'loading'
          ? [h('circle', { class: 'varo-toast__spinner-track', cx: 12, cy: 12, r: 8.5 }), h('path', { class: 'varo-toast__spinner-arc', d: 'M12 3.5a8.5 8.5 0 0 1 8.5 8.5' })]
          : [h('circle', { cx: 12, cy: 12, r: 8.5 }), h('path', { d: 'M12 10.5V16 M12 7.5h.01' })]

  return h('span', { 'class': 'varo-toast__icon', 'aria-hidden': 'true' }, [
    h('svg', { ...common, class: type === 'loading' ? 'varo-toast__spinner' : undefined }, icon),
  ])
}

function renderCloseIcon() {
  return h('svg', {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-linecap': 'round',
    'stroke-width': 1.8,
    'viewBox': '0 0 20 20',
    'aria-hidden': 'true',
  }, [h('path', { d: 'm6.5 6.5 7 7 M13.5 6.5l-7 7' })])
}

export const VToast = defineComponent({
  name: 'VToast',
  props: {
    visible: Boolean,
    message: {
      type: String,
      default: '',
    },
    type: {
      type: String as PropType<VToastType>,
      default: 'text',
    },
    position: {
      type: String as PropType<VToastPosition>,
      default: 'middle',
    },
    closeable: {
      type: Boolean,
      default: true,
    },
    closeLabel: {
      type: String,
      default: '关闭通知',
    },
  },
  emits: ['update:visible', 'close'],
  setup(props, { attrs, emit, slots }) {
    function close() {
      emit('update:visible', false)
      emit('close')
    }

    return () =>
      h(
        Transition,
        { appear: true, name: 'varo-toast' },
        {
          default: () => props.visible
            ? h(
                'div',
                {
                  ...attrs,
                  'class': ['varo-toast', attrs.class],
                  'role': props.type === 'danger' || props.type === 'warning' ? 'alert' : 'status',
                  'aria-atomic': 'true',
                  'aria-busy': props.type === 'loading' || undefined,
                  'aria-live': props.type === 'danger' || props.type === 'warning' ? 'assertive' : 'polite',
                  'data-type': props.type,
                  'data-position': props.position,
                },
                [
                  renderToastIcon(props.type),
                  h('span', { class: 'varo-toast__message' }, slots.default?.() ?? props.message),
                  props.closeable
                    ? h('button', {
                        'aria-label': props.closeLabel,
                        'class': 'varo-toast__close',
                        'type': 'button',
                        'onClick': close,
                      }, renderCloseIcon())
                    : null,
                ],
              )
            : null,
        },
      )
  },
})
