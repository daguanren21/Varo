import '../../styles/varo.css'
import { defineComponent, h } from 'vue'

const defaultKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

export const VNumberKeyboard = defineComponent({
  name: 'VNumberKeyboard',
  props: {
    closeText: {
      type: String,
      default: 'Done'
    },
    deleteText: {
      type: String,
      default: 'Delete'
    },
    extraKey: {
      type: String,
      default: ''
    },
    visible: Boolean
  },
  emits: ['input', 'delete', 'close'],
  setup(props, { emit }) {
    return () =>
      props.visible
        ? h('div', { class: 'varo-number-keyboard' }, [
            h(
              'div',
              { class: 'varo-number-keyboard__keys' },
              [...defaultKeys, props.extraKey].filter(Boolean).map((key) =>
                h(
                  'button',
                  {
                    class: 'varo-number-keyboard__key',
                    type: 'button',
                    'data-key': key,
                    onClick: () => emit('input', key)
                  },
                  key
                )
              )
            ),
            h('button', { class: 'varo-number-keyboard__delete', type: 'button', onClick: () => emit('delete') }, props.deleteText),
            h('button', { class: 'varo-number-keyboard__close', type: 'button', onClick: () => emit('close') }, props.closeText)
          ])
        : null
  }
})
