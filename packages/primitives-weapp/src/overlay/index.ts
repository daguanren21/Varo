import type { PropType, StyleValue } from 'vue'
import type { OverlayDimension } from './types'
import { useBodyScrollLock, useOverlayRoot } from '@varo-ui/headless'
import { computed, defineComponent, h, toRef } from 'vue'
import { usePropPresence } from '../vue-control'
import { vueReactiveRuntime } from '../vue-runtime'

export type * from './types'

function normalizeDuration(value: OverlayDimension | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}s` : value
}

export const OverlayRoot = defineComponent({
  name: 'OverlayRoot',
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
    const visibleControlled = usePropPresence('visible')
    const overlay = useOverlayRoot({
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
      },
    })
    const style = computed(() => ({
      'zIndex': props.zIndex,
      '--varo-overlay-duration': normalizeDuration(props.duration),
    }))

    useBodyScrollLock(overlay.state.visible, toRef(props, 'lockScroll'))

    return () => {
      if (!overlay.state.visible.value) {
        return null
      }

      return h(
        'div',
        {
          ...attrs,
          ...overlay.attrs.root,
          'class': attrs.class,
          'style': [attrs.style as StyleValue, style.value],
          'data-lock-scroll': String(props.lockScroll),
          'data-state': overlay.state.visible.value ? 'open' : 'closed',
          'onClick': (event: MouseEvent) => {
            emit('click', event)
            overlay.events.onOverlayClick()
          },
        },
        slots.default?.(),
      )
    }
  },
})
