import '../../styles/varo.css'
import { computed, defineComponent, h, type PropType, type StyleValue } from 'vue'
import { createVariantClass } from '@varo/shared'
import {
  PopupRoot,
  type PopupCloseIconPosition,
  type PopupDimension,
  type PopupPosition
} from '../../lib/varo-primitives'

export const VPopup = defineComponent({
  name: 'VPopup',
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
    const classes = computed(() =>
      createVariantClass('varo-popup', {
        position: props.position,
        round: props.round,
        closeable: props.closeable
      })
    )

    return () =>
      h(
        PopupRoot,
        {
          ...attrs,
          class: [classes.value, attrs.class],
          closeable: props.closeable,
          closeIcon: props.closeIcon,
          closeIconPosition: props.closeIconPosition,
          closeOnClickOverlay: props.closeOnClickOverlay,
          defaultVisible: props.defaultVisible,
          destroyOnClose: props.destroyOnClose,
          disabled: props.disabled,
          duration: props.duration,
          lockScroll: props.lockScroll,
          overlay: props.overlay,
          position: props.position,
          round: props.round,
          safeAreaInsetBottom: props.safeAreaInsetBottom,
          style: attrs.style as StyleValue,
          visible: props.visible,
          zIndex: props.zIndex,
          onClickOverlay: () => emit('clickOverlay'),
          onClose: () => emit('close'),
          'onUpdate:visible': (visible: boolean) => emit('update:visible', visible),
          onVisibleChange: (visible: boolean) => emit('visibleChange', visible)
        },
        slots
      )
  }
})
