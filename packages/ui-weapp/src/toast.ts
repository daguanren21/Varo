import { defineComponent, h, type PropType } from 'vue'

export type VToastPosition = 'top' | 'middle' | 'bottom'
export type VToastType = 'text' | 'success' | 'warning' | 'danger' | 'loading'

export const VToast = defineComponent({
  name: 'VToast',
  props: {
    visible: Boolean,
    message: {
      type: String,
      default: ''
    },
    type: {
      type: String as PropType<VToastType>,
      default: 'text'
    },
    position: {
      type: String as PropType<VToastPosition>,
      default: 'middle'
    },
    closeable: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:visible', 'close'],
  setup(props, { attrs, emit, slots }) {
    function close() {
      emit('update:visible', false)
      emit('close')
    }

    return () =>
      props.visible
        ? h(
            'div',
            {
              ...attrs,
              class: ['varo-toast', attrs.class],
              role: 'status',
              'data-type': props.type,
              'data-position': props.position
            },
            [
              h('span', { class: 'varo-toast__message' }, slots.default?.() ?? props.message),
              props.closeable ? h('button', { class: 'varo-toast__close', type: 'button', onClick: close }, '×') : null
            ]
          )
        : null
  }
})
