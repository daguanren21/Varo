import { computed, defineComponent, h, nextTick, shallowRef, watch } from 'vue'
import '../../styles/varo.css'

type PullRefreshState = 'idle' | 'loading' | 'pulling' | 'ready'

export const VPullRefresh = defineComponent({
  name: 'VPullRefresh',
  props: {
    disabled: Boolean,
    headHeight: {
      type: Number,
      default: 48,
    },
    loading: Boolean,
    loadingText: {
      type: String,
      default: '加载中',
    },
    pullText: {
      type: String,
      default: '下拉刷新',
    },
    releaseText: {
      type: String,
      default: '释放刷新',
    },
    threshold: {
      type: Number,
      default: 64,
    },
  },
  emits: ['refresh'],
  setup(props, { attrs, emit, slots }) {
    const rootElement = shallowRef<HTMLElement | null>(null)
    const distance = shallowRef(props.loading ? props.headHeight : 0)
    const dragging = shallowRef(false)
    let startY: number | undefined
    let pointerId: number | undefined

    const state = computed<PullRefreshState>(() => {
      if (props.loading) {
        return 'loading'
      }
      if (distance.value >= props.threshold) {
        return 'ready'
      }
      return distance.value > 0 ? 'pulling' : 'idle'
    })
    const indicatorText = computed(() => {
      if (state.value === 'loading') {
        return props.loadingText
      }
      if (state.value === 'ready') {
        return props.releaseText
      }
      return props.pullText
    })
    const trackStyle = computed(() => ({
      transform: `translate3d(0, ${distance.value}px, 0)`,
      transition: dragging.value ? 'none' : 'transform 180ms ease',
    }))
    const indicatorStyle = computed(() => ({
      height: `${props.headHeight}px`,
      marginTop: `${-props.headHeight}px`,
    }))

    function releaseCapturedPointer(activePointerId: number | undefined) {
      if (activePointerId === undefined) {
        return
      }
      try {
        rootElement.value?.releasePointerCapture?.(activePointerId)
      }
      catch {
        // Synthetic events and interrupted pointers may not own capture.
      }
    }

    function resetGesture() {
      const activePointerId = pointerId
      startY = undefined
      pointerId = undefined
      dragging.value = false
      distance.value = 0
      releaseCapturedPointer(activePointerId)
    }

    watch(() => props.loading, (loading) => {
      resetGesture()
      distance.value = loading ? props.headHeight : 0
    })

    function begin(clientY: number): boolean {
      if (
        startY !== undefined
        || props.disabled
        || props.loading
        || (rootElement.value?.scrollTop ?? 0) > 0
      ) {
        return false
      }
      distance.value = 0
      startY = clientY
      dragging.value = false
      return true
    }

    function move(clientY: number, event: Event) {
      if (startY === undefined || props.disabled || props.loading) {
        return
      }
      if ((rootElement.value?.scrollTop ?? 0) > 0) {
        resetGesture()
        return
      }
      const delta = clientY - startY
      if (delta <= 0) {
        distance.value = 0
        return
      }
      event.preventDefault()
      dragging.value = true
      distance.value = Math.min(delta * 0.5, props.threshold * 1.5)
    }

    function finish(allowRefresh: boolean, endingPointerId?: number) {
      if (startY === undefined) {
        return
      }
      if (endingPointerId !== undefined && pointerId !== endingPointerId) {
        return
      }
      const shouldRefresh = allowRefresh
        && distance.value >= props.threshold
        && !props.disabled
        && !props.loading
        && (rootElement.value?.scrollTop ?? 0) <= 0
      const activePointerId = pointerId
      startY = undefined
      pointerId = undefined
      dragging.value = false
      releaseCapturedPointer(activePointerId)
      if (!shouldRefresh) {
        distance.value = 0
        return
      }
      emit('refresh')
      void nextTick(() => {
        distance.value = props.loading ? props.headHeight : 0
      })
    }

    function touchStart(event: TouchEvent) {
      const touch = event.touches[0]
      if (touch) {
        begin(touch.clientY)
      }
    }

    function touchMove(event: TouchEvent) {
      const touch = event.touches[0]
      if (touch) {
        move(touch.clientY, event)
      }
    }

    function pointerDown(event: PointerEvent) {
      if (event.pointerType === 'touch' || !begin(event.clientY)) {
        return
      }
      pointerId = event.pointerId
      try {
        rootElement.value?.setPointerCapture?.(event.pointerId)
      }
      catch {
        // Synthetic events do not own an active browser pointer.
      }
    }

    function pointerMove(event: PointerEvent) {
      if (pointerId === event.pointerId) {
        move(event.clientY, event)
      }
    }

    function pointerUp(event: PointerEvent) {
      if (event.pointerType !== 'touch') {
        finish(true, event.pointerId)
      }
    }

    function pointerCancel(event: PointerEvent) {
      if (event.pointerType !== 'touch') {
        finish(false, event.pointerId)
      }
    }

    return () => h('div', {
      ...attrs,
      'aria-busy': String(props.loading),
      'class': ['varo-pull-refresh', attrs.class],
      'data-disabled': String(props.disabled),
      'data-state': state.value,
      'onPointercancel': pointerCancel,
      'onPointerdown': pointerDown,
      'onPointermove': pointerMove,
      'onPointerup': pointerUp,
      'onTouchcancel': () => finish(false),
      'onTouchend': () => finish(true),
      'onTouchmove': touchMove,
      'onTouchstart': touchStart,
      'ref': (element: unknown) => {
        rootElement.value = element instanceof HTMLElement ? element : null
      },
    }, [
      h('div', { class: 'varo-pull-refresh__track', style: trackStyle.value }, [
        h('div', {
          'aria-live': 'polite',
          'class': 'varo-pull-refresh__indicator',
          'role': 'status',
          'style': indicatorStyle.value,
        }, slots.indicator?.({ distance: distance.value, state: state.value }) ?? indicatorText.value),
        h('div', { class: 'varo-pull-refresh__content' }, slots.default?.()),
      ]),
    ])
  },
})
