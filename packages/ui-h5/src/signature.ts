import type { PropType } from 'vue'
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

export interface SignaturePoint {
  x: number
  y: number
}

export interface SignatureStroke {
  points: SignaturePoint[]
}

function cloneStrokes(strokes: SignatureStroke[]): SignatureStroke[] {
  return strokes.map(stroke => ({ points: stroke.points.map(point => ({ ...point })) }))
}

export const VSignature = defineComponent({
  name: 'VSignature',
  props: {
    ariaLabel: {
      type: String,
      default: 'Signature pad',
    },
    background: {
      type: String,
      default: '#ffffff',
    },
    clearText: {
      type: String,
      default: '清除签名',
    },
    disabled: Boolean,
    height: {
      type: Number,
      default: 200,
    },
    lineColor: {
      type: String,
      default: '#172033',
    },
    lineWidth: {
      type: Number,
      default: 2,
    },
    showClear: {
      type: Boolean,
      default: true,
    },
    value: {
      type: Array as PropType<SignatureStroke[]>,
      default: () => [],
    },
  },
  emits: ['update:value', 'change', 'start', 'end', 'clear'],
  setup(props, { attrs, emit, expose }) {
    const canvas = shallowRef<HTMLCanvasElement | null>(null)
    const strokes = shallowRef(cloneStrokes(props.value))
    let currentPoints: SignaturePoint[] = []
    let activePointerId: number | undefined
    let resizeObserver: ResizeObserver | undefined
    let canvasWidth = 0
    let canvasHeight = props.height

    const empty = computed(() => strokes.value.length === 0)
    const canvasStyle = computed(() => ({
      background: props.background,
      height: `${props.height}px`,
    }))

    function context(): CanvasRenderingContext2D | null {
      return canvas.value?.getContext('2d') ?? null
    }

    function prepareContext(ctx: CanvasRenderingContext2D) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = props.lineWidth
      ctx.strokeStyle = props.lineColor
    }

    function drawStroke(ctx: CanvasRenderingContext2D, stroke: SignatureStroke) {
      if (stroke.points.length === 0) {
        return
      }
      prepareContext(ctx)
      ctx.beginPath()
      const first = stroke.points[0]
      const firstX = first.x * canvasWidth
      const firstY = first.y * canvasHeight
      if (stroke.points.length === 1) {
        ctx.fillStyle = props.lineColor
        ctx.arc(firstX, firstY, Math.max(0.5, props.lineWidth / 2), 0, Math.PI * 2)
        ctx.fill()
        return
      }
      ctx.moveTo(firstX, firstY)
      for (const point of stroke.points.slice(1)) {
        ctx.lineTo(point.x * canvasWidth, point.y * canvasHeight)
      }
      ctx.stroke()
    }

    function redraw() {
      const ctx = context()
      if (!ctx) {
        return
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = props.background
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      for (const stroke of strokes.value) {
        drawStroke(ctx, stroke)
      }
    }

    function resizeCanvas() {
      const element = canvas.value
      if (!element) {
        return
      }
      const rect = element.getBoundingClientRect()
      canvasWidth = Math.max(1, rect.width)
      canvasHeight = Math.max(1, props.height)
      const ratio = Math.max(1, window.devicePixelRatio || 1)
      element.width = Math.round(canvasWidth * ratio)
      element.height = Math.round(canvasHeight * ratio)
      const ctx = context()
      ctx?.setTransform(ratio, 0, 0, ratio, 0, 0)
      redraw()
    }

    function pointFromEvent(event: PointerEvent): SignaturePoint | undefined {
      const element = canvas.value
      if (!element || canvasWidth <= 0 || canvasHeight <= 0) {
        return undefined
      }
      const rect = element.getBoundingClientRect()
      return {
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / canvasWidth)),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / canvasHeight)),
      }
    }

    function pointerDown(event: PointerEvent) {
      if (props.disabled || activePointerId !== undefined) {
        return
      }
      const point = pointFromEvent(event)
      if (!point) {
        return
      }
      activePointerId = event.pointerId
      currentPoints = [point]
      try {
        canvas.value?.setPointerCapture?.(event.pointerId)
      }
      catch {
        // Synthetic pointer events may not own browser capture.
      }
      emit('start')
    }

    function pointerMove(event: PointerEvent) {
      if (props.disabled || activePointerId !== event.pointerId || currentPoints.length === 0) {
        return
      }
      const point = pointFromEvent(event)
      if (!point) {
        return
      }
      event.preventDefault()
      const previous = currentPoints[currentPoints.length - 1]
      currentPoints.push(point)
      const ctx = context()
      if (!ctx) {
        return
      }
      prepareContext(ctx)
      ctx.beginPath()
      ctx.moveTo(previous.x * canvasWidth, previous.y * canvasHeight)
      ctx.lineTo(point.x * canvasWidth, point.y * canvasHeight)
      ctx.stroke()
    }

    function samePoint(left: SignaturePoint, right: SignaturePoint) {
      return left.x === right.x && left.y === right.y
    }

    function releaseActivePointer() {
      if (activePointerId === undefined) {
        return
      }
      const pointerId = activePointerId
      activePointerId = undefined
      try {
        canvas.value?.releasePointerCapture?.(pointerId)
      }
      catch {
        // Interrupted pointers may already have released capture.
      }
    }

    function cancelActiveStroke() {
      releaseActivePointer()
      currentPoints = []
      redraw()
    }

    function finish(event: PointerEvent, commit: boolean) {
      if (activePointerId !== event.pointerId) {
        return
      }
      if (props.disabled || !commit || currentPoints.length === 0) {
        cancelActiveStroke()
        return
      }
      const terminalPoint = pointFromEvent(event)
      const previousPoint = currentPoints[currentPoints.length - 1]
      if (terminalPoint && !samePoint(previousPoint, terminalPoint)) {
        currentPoints.push(terminalPoint)
      }
      releaseActivePointer()
      const stroke = { points: currentPoints.map(point => ({ ...point })) }
      const next = [...strokes.value, stroke]
      currentPoints = []
      emit('update:value', cloneStrokes(next))
      emit('change', cloneStrokes(next))
      emit('end', { points: stroke.points.map(point => ({ ...point })) })
      void nextTick(redraw)
    }
    function clear() {
      if (props.disabled || strokes.value.length === 0) {
        return
      }
      currentPoints = []
      emit('update:value', [])
      emit('change', [])
      emit('clear')
      void nextTick(redraw)
    }

    watch(() => props.value, (value) => {
      strokes.value = cloneStrokes(value)
      void nextTick(redraw)
    }, { deep: true })
    watch(() => props.disabled, (disabled) => {
      if (disabled && activePointerId !== undefined) {
        cancelActiveStroke()
      }
    })
    watch([() => props.background, () => props.height, () => props.lineColor, () => props.lineWidth], () => {
      void nextTick(resizeCanvas)
    })

    onMounted(() => {
      resizeCanvas()
      if (typeof ResizeObserver !== 'undefined' && canvas.value) {
        resizeObserver = new ResizeObserver(resizeCanvas)
        resizeObserver.observe(canvas.value)
      }
    })
    onBeforeUnmount(() => resizeObserver?.disconnect())
    expose({ clear })

    return () => h('div', {
      ...attrs,
      'class': ['varo-signature', attrs.class],
      'data-disabled': String(props.disabled),
      'data-empty': String(empty.value),
    }, [
      h('canvas', {
        'aria-disabled': props.disabled || undefined,
        'aria-label': props.ariaLabel,
        'class': 'varo-signature__canvas',
        'onPointercancel': (event: PointerEvent) => finish(event, false),
        'onPointerdown': pointerDown,
        'onPointermove': pointerMove,
        'onPointerup': (event: PointerEvent) => finish(event, true),
        'ref': (element: unknown) => {
          canvas.value = element instanceof HTMLCanvasElement ? element : null
        },
        'style': canvasStyle.value,
      }),
      props.showClear
        ? h('button', {
            class: 'varo-signature__clear',
            disabled: props.disabled || empty.value,
            type: 'button',
            onClick: clear,
          }, props.clearText)
        : null,
    ])
  },
})
