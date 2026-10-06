<script lang="ts">
</script>

<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useNativeInstance, watch } from 'wevu'
import { cn } from '../../lib/cn'

export interface SignaturePoint {
  x: number
  y: number
}

export interface SignatureStroke {
  points: SignaturePoint[]
}

defineOptions({
  properties: {
    value: { type: null },
  },
})

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    background?: string
    className?: ClassValue
    clearText?: string
    disabled?: boolean
    height?: number
    lineColor?: string
    lineWidth?: number
    showClear?: boolean
    value?: SignatureStroke[]
  }>(),
  {
    ariaLabel: 'Signature pad',
    background: '#ffffff',
    className: undefined,
    clearText: '清除签名',
    disabled: false,
    height: 200,
    lineColor: '#172033',
    lineWidth: 2,
    showClear: true,
    value: () => [],
  },
)

const emit = defineEmits<{
  'change': [value: SignatureStroke[]]
  'clear': []
  'end': [stroke: SignatureStroke]
  'start': []
  'update:value': [value: SignatureStroke[]]
}>()

let signatureSequence = 0

function nextSignatureId() {
  signatureSequence += 1
  return `varo-signature-${signatureSequence}`
}

interface SignatureTouch {
  identifier?: number
  clientX?: number
  clientY?: number
  x?: number
  y?: number
}

interface SignatureTouchDetail {
  changedTouches?: ArrayLike<SignatureTouch>
  touches?: ArrayLike<SignatureTouch>
}
function eventTouch(event: TouchEvent, changed = false, identifier?: number): SignatureTouch | undefined {
  const directTouches = (changed ? event.changedTouches : event.touches) as unknown as ArrayLike<SignatureTouch> | undefined
  const detail = (event as TouchEvent & { detail?: SignatureTouchDetail }).detail
  const detailTouches = changed ? detail?.changedTouches : detail?.touches
  const touches = directTouches?.length ? directTouches : detailTouches
  if (identifier === undefined) {
    return touches?.[0]
  }
  for (let index = 0; index < (touches?.length ?? 0); index += 1) {
    const touch = touches?.[index]
    if (touch?.identifier === identifier) {
      return touch
    }
  }
  return undefined
}

function cloneStrokes(strokes: SignatureStroke[]): SignatureStroke[] {
  return strokes.map(stroke => ({ points: stroke.points.map(point => ({ ...point })) }))
}

const nativeInstance = useNativeInstance()
const owner = nativeInstance as unknown as WechatMiniprogram.Component.TrivialInstance
const canvasId = nextSignatureId()
const classes = computed(() => cn('varo-signature', props.className))
const canvasStyle = computed(() => `height: ${props.height}px; background: ${props.background}`)
const strokes = shallowRef(cloneStrokes(props.value))
const dataDisabled = computed<'true' | 'false'>(() => props.disabled ? 'true' : 'false')
const dataEmpty = computed(() => String(strokes.value.length === 0))
let context: WechatMiniprogram.CanvasContext | undefined
let currentPoints: SignaturePoint[] = []
let activeTouchId: number | undefined
let canvasWidth = 320
let canvasHeight = props.height
let initializeTimer: ReturnType<typeof setTimeout> | undefined

function prepareContext() {
  if (!context) {
    return
  }
  context.setStrokeStyle(props.lineColor)
  context.setLineWidth(props.lineWidth)
  context.setLineCap('round')
  context.setLineJoin('round')
}

function drawStroke(stroke: SignatureStroke) {
  if (!context || stroke.points.length === 0) {
    return
  }
  prepareContext()
  context.beginPath()
  const first = stroke.points[0]
  const firstX = first.x * canvasWidth
  const firstY = first.y * canvasHeight
  if (stroke.points.length === 1) {
    context.setFillStyle(props.lineColor)
    context.arc(firstX, firstY, Math.max(0.5, props.lineWidth / 2), 0, Math.PI * 2)
    context.fill()
    return
  }
  context.moveTo(firstX, firstY)
  for (const point of stroke.points.slice(1)) {
    context.lineTo(point.x * canvasWidth, point.y * canvasHeight)
  }
  context.stroke()
}

function redraw() {
  if (!context) {
    return
  }
  context.clearRect(0, 0, canvasWidth, canvasHeight)
  context.setFillStyle(props.background)
  context.fillRect(0, 0, canvasWidth, canvasHeight)
  for (const stroke of strokes.value) {
    drawStroke(stroke)
  }
  context.draw()
}

function pointFromTouch(touch: SignatureTouch): SignaturePoint {
  const x = touch.x ?? touch.clientX ?? 0
  const y = touch.y ?? touch.clientY ?? 0
  return {
    x: Math.min(1, Math.max(0, x / canvasWidth)),
    y: Math.min(1, Math.max(0, y / canvasHeight)),
  }
}

function touchStart(event: TouchEvent) {
  if (props.disabled || currentPoints.length > 0) {
    return
  }
  const touch = eventTouch(event)
  if (!touch) {
    return
  }
  activeTouchId = touch.identifier
  currentPoints = [pointFromTouch(touch)]
  emit('start')
}

function touchCancel(event?: TouchEvent) {
  if (event && activeTouchId !== undefined && !eventTouch(event, true, activeTouchId)) {
    return
  }
  activeTouchId = undefined
  currentPoints = []
  redraw()
}

function touchMove(event: TouchEvent) {
  if (props.disabled) {
    if (currentPoints.length > 0) {
      touchCancel()
    }
    return
  }
  if (currentPoints.length === 0) {
    return
  }
  const touch = eventTouch(event, false, activeTouchId)
  if (!touch) {
    return
  }
  const point = pointFromTouch(touch)
  const previous = currentPoints[currentPoints.length - 1]
  currentPoints.push(point)
  if (!context) {
    return
  }
  prepareContext()
  context.beginPath()
  context.moveTo(previous.x * canvasWidth, previous.y * canvasHeight)
  context.lineTo(point.x * canvasWidth, point.y * canvasHeight)
  context.stroke()
  context.draw(true)
}

function samePoint(left: SignaturePoint, right: SignaturePoint) {
  return left.x === right.x && left.y === right.y
}

function touchEnd(event: TouchEvent) {
  if (props.disabled) {
    touchCancel()
    return
  }
  if (currentPoints.length === 0) {
    return
  }
  const touch = eventTouch(event, true, activeTouchId)
  if (activeTouchId !== undefined && !touch) {
    return
  }
  const terminalPoint = touch ? pointFromTouch(touch) : undefined
  const previousPoint = currentPoints[currentPoints.length - 1]
  if (terminalPoint && !samePoint(previousPoint, terminalPoint)) {
    currentPoints.push(terminalPoint)
  }
  activeTouchId = undefined
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
  activeTouchId = undefined
  currentPoints = []
  emit('update:value', [])
  emit('change', [])
  emit('clear')
  void nextTick(redraw)
}

function initialize() {
  context = wx.createCanvasContext(canvasId, owner)
  const query = nativeInstance.createSelectorQuery() ?? wx.createSelectorQuery().in(owner)
  query.select(`#${canvasId}`).boundingClientRect((rect) => {
    if (rect) {
      canvasWidth = Math.max(1, rect.width)
      canvasHeight = Math.max(1, rect.height)
    }
    redraw()
  }).exec()
}

function scheduleInitialize() {
  clearTimeout(initializeTimer)
  initializeTimer = setTimeout(() => {
    initializeTimer = undefined
    initialize()
  }, 0)
}

watch(() => props.value, (value) => {
  strokes.value = cloneStrokes(value)
  redraw()
}, { deep: true })
watch([() => props.background, () => props.lineColor, () => props.lineWidth], redraw)
watch(() => props.height, scheduleInitialize)
watch(() => props.disabled, (disabled) => {
  if (disabled && currentPoints.length > 0) {
    touchCancel()
  }
})

onMounted(() => {
  scheduleInitialize()
  wx.onWindowResize?.(scheduleInitialize)
})
onBeforeUnmount(() => {
  clearTimeout(initializeTimer)
  wx.offWindowResize?.(scheduleInitialize)
})

defineExpose({ clear })
</script>

<template>
  <view :class="classes" :data-disabled="dataDisabled" :data-empty="dataEmpty">
    <canvas
      :id="canvasId"
      :canvas-id="canvasId"
      class="varo-signature__canvas"
      :style="canvasStyle"
      :aria-label="props.ariaLabel"
      :aria-disabled="dataDisabled"
      :disable-scroll="true"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
      @touchcancel="touchCancel"
    />
    <button
      v-if="props.showClear"
      class="varo-signature__clear"
      type="button"
      :disabled="props.disabled || strokes.length === 0"
      @click="clear"
    >
      {{ props.clearText }}
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
