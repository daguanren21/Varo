import '../../styles/varo.css'
import { defineComponent, h, type PropType } from 'vue'
import { VLoading } from './loading'
import { VPopup } from './popup'

export interface ActionSheetItem {
  color?: string
  description?: string
  disabled?: boolean
  loading?: boolean
  name: string
  value?: unknown
}

export const VActionSheet = defineComponent({
  name: 'VActionSheet',
  props: {
    actions: {
      type: Array as PropType<ActionSheetItem[]>,
      default: () => []
    },
    cancelText: String,
    closeOnSelect: {
      type: Boolean,
      default: true
    },
    description: String,
    title: String,
    visible: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    }
  },
  emits: ['cancel', 'close', 'select', 'update:visible'],
  setup(props, { attrs, emit, slots }) {
    function close(reason: 'cancel' | 'overlay' | 'select') {
      emit('update:visible', false)
      emit('close', reason)
    }

    function select(item: ActionSheetItem, index: number) {
      if (item.disabled || item.loading) return
      emit('select', { index, item })
      if (props.closeOnSelect) close('select')
    }

    function cancel() {
      emit('cancel')
      close('cancel')
    }

    return () =>
      h(
        VPopup,
        {
          ...attrs,
          class: ['varo-action-sheet', attrs.class],
          closeOnClickOverlay: true,
          position: 'bottom',
          round: true,
          safeAreaInsetBottom: true,
          visible: props.visible,
          'onUpdate:visible': (visible: boolean) => emit('update:visible', visible),
          onClickOverlay: () => close('overlay')
        },
        {
          default: () => [
            props.title || props.description || slots.header
              ? h('header', { class: 'varo-action-sheet__header' }, [
                  slots.header?.() ?? [
                    props.title ? h('h3', { class: 'varo-action-sheet__title' }, props.title) : null,
                    props.description
                      ? h('p', { class: 'varo-action-sheet__description' }, props.description)
                      : null
                  ]
                ])
              : null,
            h(
              'div',
              { class: 'varo-action-sheet__actions' },
              props.actions.map((item, index) =>
                h(
                  'button',
                  {
                    key: `${index}-${item.name}`,
                    class: 'varo-action-sheet__action',
                    type: 'button',
                    disabled: item.disabled || item.loading,
                    style: item.color ? { color: item.color } : undefined,
                    'data-loading': String(Boolean(item.loading)),
                    onClick: () => select(item, index)
                  },
                  [
                    item.loading ? h(VLoading, { size: 'sm' }) : null,
                    h('span', { class: 'varo-action-sheet__name' }, item.name),
                    item.description
                      ? h('span', { class: 'varo-action-sheet__item-description' }, item.description)
                      : null
                  ]
                )
              )
            ),
            slots.default?.(),
            props.cancelText
              ? h(
                  'button',
                  {
                    class: 'varo-action-sheet__cancel',
                    type: 'button',
                    onClick: cancel
                  },
                  props.cancelText
                )
              : null
          ]
        }
      )
  }
})
