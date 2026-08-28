import type { PropType, StyleValue } from 'vue'
import type { OverlayDimension } from '../../lib/varo-primitives'
import { createVariantClass } from '@varo-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { OverlayRoot } from '../../lib/varo-primitives'
import '../../styles/varo.css'

export const VOverlay = defineComponent({
  name: 'VOverlay',
  props: {
    defaultVisible: Boolean,
    visible: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disabled: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    zIndex: {
      type: [Number, String] as PropType<OverlayDimension | undefined>,
      default: undefined,
    },
    duration: {
      type: [Number, String] as PropType<OverlayDimension | undefined>,
      default: undefined,
    },
    lockScroll: Boolean,
    closeOnClickOverlay: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:visible', 'visibleChange', 'close', 'click'],
  setup(props, { attrs, emit, slots }) {
    const classes = computed(() =>
      createVariantClass('varo-overlay', {
        disabled: props.disabled,
      }),
    )

    return () =>
      h(
        OverlayRoot,
        {
          ...attrs,
          'class': [classes.value, attrs.class],
          'closeOnClickOverlay': props.closeOnClickOverlay,
          'defaultVisible': props.defaultVisible,
          'disabled': props.disabled,
          'duration': props.duration,
          'lockScroll': props.lockScroll,
          'style': attrs.style as StyleValue,
          'visible': props.visible,
          'zIndex': props.zIndex,
          'onClick': (event: MouseEvent) => emit('click', event),
          'onClose': () => emit('close'),
          'onUpdate:visible': (visible: boolean) => emit('update:visible', visible),
          'onVisibleChange': (visible: boolean) => emit('visibleChange', visible),
        },
        slots,
      )
  },
})
