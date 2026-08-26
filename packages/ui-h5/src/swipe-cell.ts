import { computed, defineComponent, h, shallowRef, watch, type PropType, type StyleValue } from 'vue'

export type SwipeCellSide = 'left' | 'right' | null

interface TouchLikeEvent {
  changedTouches?: ArrayLike<{ clientX: number }>
  touches?: ArrayLike<{ clientX: number }>
}

export const VSwipeCell = defineComponent({
  name: 'VSwipeCell',
  props: {
    disabled: Boolean,
    leftWidth: {
      type: Number,
      default: 0
    },
    modelValue: {
      type: String as PropType<Exclude<SwipeCellSide, null> | undefined>,
      default: undefined
    },
    rightWidth: {
      type: Number,
      default: 0
    },
    threshold: {
      type: Number,
      default: 0.3
    }
  },
  emits: ['close', 'open', 'update:modelValue'],
  setup(props, { attrs, emit, slots }) {
    const currentSide = shallowRef<SwipeCellSide>(props.modelValue ?? null)
    const dragging = shallowRef(false)
    const dragOffset = shallowRef(0)
    const startOffset = shallowRef(0)
    const startX = shallowRef(0)
    const restingOffset = computed(() => {
      if (currentSide.value === 'left') return props.leftWidth
      if (currentSide.value === 'right') return -props.rightWidth
      return 0
    })
    const offset = computed(() => (dragging.value ? dragOffset.value : restingOffset.value))
    const contentStyle = computed<StyleValue>(() => ({ transform: `translate3d(${offset.value}px, 0, 0)` }))

    watch(
      () => props.modelValue,
      (side) => {
        currentSide.value = side ?? null
      }
    )

    function pointX(event: TouchLikeEvent): number | undefined {
      return event.touches?.[0]?.clientX ?? event.changedTouches?.[0]?.clientX
    }

    function open(side: Exclude<SwipeCellSide, null>) {
      currentSide.value = side
      emit('update:modelValue', side)
      emit('open', side)
    }

    function close() {
      currentSide.value = null
      emit('update:modelValue', undefined)
      emit('close')
    }

    function onTouchStart(event: TouchLikeEvent) {
      if (props.disabled) return
      const x = pointX(event)
      if (x === undefined) return
      dragging.value = true
      startX.value = x
      startOffset.value = restingOffset.value
      dragOffset.value = restingOffset.value
    }

    function onTouchMove(event: TouchLikeEvent) {
      if (!dragging.value || props.disabled) return
      const x = pointX(event)
      if (x === undefined) return
      dragOffset.value = Math.max(-props.rightWidth, Math.min(props.leftWidth, startOffset.value + x - startX.value))
    }

    function onTouchEnd() {
      if (!dragging.value) return
      dragging.value = false

      if (props.leftWidth > 0 && dragOffset.value >= props.leftWidth * props.threshold) {
        open('left')
        return
      }
      if (props.rightWidth > 0 && dragOffset.value <= -props.rightWidth * props.threshold) {
        open('right')
        return
      }
      close()
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: ['varo-swipe-cell', attrs.class],
          'data-dragging': String(dragging.value),
          'data-open': currentSide.value ?? 'none'
        },
        [
          props.leftWidth > 0
            ? h(
                'div',
                { class: 'varo-swipe-cell__actions varo-swipe-cell__actions--left', style: { width: `${props.leftWidth}px` } },
                slots.left?.({ close })
              )
            : null,
          props.rightWidth > 0
            ? h(
                'div',
                { class: 'varo-swipe-cell__actions varo-swipe-cell__actions--right', style: { width: `${props.rightWidth}px` } },
                slots.right?.({ close })
              )
            : null,
          h(
            'div',
            {
              class: 'varo-swipe-cell__content',
              style: contentStyle.value,
              onTouchstart: onTouchStart,
              onTouchmove: onTouchMove,
              onTouchend: onTouchEnd,
              onTouchcancel: onTouchEnd
            },
            slots.default?.({ close, open })
          )
        ]
      )
  }
})
