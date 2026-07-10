import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  toRef,
  watch,
  type PropType,
  type StyleValue
} from 'vue'
import { useBodyScrollLock, usePopupRoot, type PopupCloseIconPosition, type PopupPosition } from '@varo/primitives-core'
import { vueReactiveRuntime } from '../vue-runtime'
import { usePropPresence } from '../vue-control'
import type { PopupDimension } from './types'

export type * from './types'

function normalizeDuration(value: PopupDimension | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}s` : value
}

function normalizeContentZIndex(value: PopupDimension | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  if (typeof value === 'number') {
    return value + 1
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue + 1 : value
}

export const PopupRoot = defineComponent({
  name: 'PopupRoot',
  props: {
    defaultVisible: Boolean,
    visible: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    disabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    position: {
      type: String as PropType<PopupPosition>,
      default: 'bottom'
    },
    overlay: {
      type: Boolean,
      default: true
    },
    closeable: Boolean,
    closeIcon: {
      type: String,
      default: '×'
    },
    closeIconPosition: {
      type: String as PropType<PopupCloseIconPosition>,
      default: 'top-right'
    },
    round: Boolean,
    safeAreaInsetBottom: Boolean,
    lockScroll: Boolean,
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: [Number, String] as PropType<PopupDimension | undefined>,
      default: undefined
    },
    duration: {
      type: [Number, String] as PropType<PopupDimension | undefined>,
      default: undefined
    },
    destroyOnClose: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:visible', 'visibleChange', 'close', 'clickOverlay'],
  setup(props, { attrs, emit, slots }) {
    const visibleControlled = usePropPresence('visible')
    const popup = usePopupRoot({
      visibleControlled,
      runtime: vueReactiveRuntime,
      defaultVisible: props.defaultVisible,
      visible: toRef(props, 'visible'),
      disabled: toRef(props, 'disabled'),
      closeOnClickOverlay: toRef(props, 'closeOnClickOverlay'),
      onVisibleChange(visible) {
        emit('update:visible', visible)
        emit('visibleChange', visible)
      },
      onClose() {
        emit('close')
      }
    })
    const visible = popup.state.visible
    const shouldRender = computed(() => visible.value || !props.destroyOnClose)
    const overlayStyle = computed(() => ({
      zIndex: props.zIndex,
      '--varo-overlay-duration': normalizeDuration(props.duration)
    }))
    const contentStyle = computed(() => ({
      zIndex: normalizeContentZIndex(props.zIndex),
      '--varo-popup-duration': normalizeDuration(props.duration)
    }))

    function handleDocumentKeydown(event: KeyboardEvent) {
      if (!visible.value || event.key !== 'Escape') {
        return
      }

      popup.events.onEscapeKeyDown()
    }

    onMounted(() => {
      document.addEventListener('keydown', handleDocumentKeydown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleDocumentKeydown)
    })

    const scrollLock = useBodyScrollLock(visible, toRef(props, 'lockScroll'))
    watch([() => visible.value, () => props.lockScroll], scrollLock.sync)
    onBeforeUnmount(scrollLock.dispose)

    return () => {
      if (!shouldRender.value) {
        return null
      }

      return h(
        'div',
        {
          ...attrs,
          ...popup.attrs.root,
          class: attrs.class,
          style: attrs.style as StyleValue,
          'data-state': visible.value ? 'open' : 'closed',
          'data-position': props.position
        },
        [
          props.overlay && visible.value
            ? h('div', {
                ...popup.attrs.overlay,
                class: 'varo-popup__overlay',
                style: overlayStyle.value,
                'data-state': visible.value ? 'open' : 'closed',
                onClick: () => {
                  emit('clickOverlay')
                  popup.events.onOverlayClick()
                }
              })
            : null,
          h(
            'div',
            {
              ...popup.attrs.content,
              class: 'varo-popup__content',
              hidden: !visible.value,
              style: contentStyle.value,
              'data-position': props.position,
              'data-round': String(props.round),
              'data-state': visible.value ? 'open' : 'closed',
              'data-safe-area-inset-bottom': String(props.safeAreaInsetBottom)
            },
            [
              slots.default?.(),
              props.closeable
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: 'varo-popup__close',
                      'aria-label': 'Close popup',
                      'data-position': props.closeIconPosition,
                      onClick: () => popup.events.close()
                    },
                    slots.closeIcon?.() ?? props.closeIcon
                  )
                : null
            ]
          )
        ]
      )
    }
  }
})
