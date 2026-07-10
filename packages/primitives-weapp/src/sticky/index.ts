import { computed, defineComponent, h, onBeforeUnmount, onMounted, shallowRef, type PropType, type StyleValue } from 'vue'
import type { StickyDimension, StickyScrollEvent } from './types'

export type * from './types'

function normalizeSize(value: StickyDimension | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

function getScrollTop() {
  if (typeof window === 'undefined') {
    return 0
  }

  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
}

export const StickyRoot = defineComponent({
  name: 'StickyRoot',
  props: {
    offsetTop: {
      type: [Number, String] as PropType<StickyDimension>,
      default: 0
    },
    zIndex: {
      type: [Number, String] as PropType<StickyDimension | undefined>,
      default: undefined
    },
    disabled: Boolean
  },
  emits: ['change', 'scroll'],
  setup(props, { attrs, emit, slots }) {
    const isFixed = shallowRef(false)
    const numericOffsetTop = computed(() => {
      const value = Number(props.offsetTop)
      return Number.isFinite(value) ? value : 0
    })
    const style = computed(() => ({
      top: normalizeSize(props.offsetTop),
      zIndex: props.zIndex,
      position: props.disabled ? undefined : 'sticky'
    }))

    function updateFixedState() {
      const scrollTop = getScrollTop()
      const nextFixed = !props.disabled && scrollTop > numericOffsetTop.value
      const event: StickyScrollEvent = {
        isFixed: nextFixed,
        scrollTop
      }

      emit('scroll', event)

      if (nextFixed !== isFixed.value) {
        isFixed.value = nextFixed
        emit('change', nextFixed)
      }
    }

    onMounted(() => {
      updateFixedState()
      window.addEventListener('scroll', updateFixedState, { passive: true })
    })

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', updateFixedState)
    })

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: attrs.class,
          style: [attrs.style as StyleValue, style.value],
          'data-disabled': String(props.disabled),
          'data-fixed': String(isFixed.value),
          'data-offset-top': String(props.offsetTop)
        },
        slots.default?.({ fixed: isFixed.value })
      )
  }
})
