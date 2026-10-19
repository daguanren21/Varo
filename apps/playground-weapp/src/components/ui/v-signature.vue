<script lang="ts">
export type { SignatureInstance, SignaturePoint, SignatureStroke } from './signature-history'
</script>

<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { SignaturePoint, SignatureStroke } from './signature-history'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, triggerRef, useNativeInstance, watch } from 'wevu'
import { cn } from '../../lib/cn'
import { cloneStrokes, createSignatureHistory } from './signature-history'

defineOptions({
  properties: {
    value: { type: null, value: null },
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
    historyLimit?: number
    lineColor?: string
    lineWidth?: number
    redoText?: string
    showHistory?: boolean
    showClear?: boolean
    undoText?: string
    value?: SignatureStroke[]
  }>(),
  {
    ariaLabel: 'Signature pad',
    background: '#ffffff',
    className: undefined,
    clearText: '清除签名',
    disabled: false,
    height: 200,
    historyLimit: 100,
    lineColor: '#172033',
    lineWidth: 2,
    redoText: '重做',
    showHistory: false,
    showClear: true,
    undoText: '撤销',
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

const nativeInstance = useNativeInstance()
const canvasId = nextSignatureId()
const classes = computed(() => cn('varo-signature', props.className))
const canvasStyle = computed(() => `height: ${props.height}px; background: ${props.background}`)
const history = shallowRef(createSignatureHistory(props.value ?? [], props.historyLimit))
const strokes = computed(() => history.value.value)
const drawing = shallowRef(false)
const canUndo = computed(() => !props.disabled && !drawing.value && history.value.canUndo)
const canRedo = computed(() => !props.disabled && !drawing.value && history.value.canRedo)
const clearDisabled = computed(() => props.disabled || drawing.value || strokes.value.length === 0)
const dataDisabled = computed<'true' | 'false'>(() => props.disabled ? 'true' : 'false')
const dataEmpty = computed(() => String(strokes.value.length === 0))
let context: WechatMiniprogram.CanvasRenderingContext.CanvasRenderingContext2D | undefined
let currentPoints: SignaturePoint[] = []
let activeTouchId: number | undefined
let canvasWidth = 320
let canvasHeight = props.height
let initializeTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false

function prepareContext() {
  if (!context) {
    return
  }
  context.strokeStyle = props.lineColor
  context.lineWidth = props.lineWidth
  context.lineCap = 'round'
  context.lineJoin = 'round'
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
    context.fillStyle = props.lineColor
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
  context.fillStyle = props.background
  context.fillRect(0, 0, canvasWidth, canvasHeight)
  for (const stroke of strokes.value) {
    drawStroke(stroke)
  }
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
  drawing.value = true
  emit('start')
}

function touchCancel(event?: TouchEvent) {
  if (event && activeTouchId !== undefined && !eventTouch(event, true, activeTouchId)) {
    return
  }
  activeTouchId = undefined
  currentPoints = []
  drawing.value = false
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
  currentPoints = []
  drawing.value = false
  emitProposal(history.value.propose([...strokes.value, stroke]))
  emit('end', { points: stroke.points.map(point => ({ ...point })) })
  void nextTick(redraw)
}

function clear() {
  if (clearDisabled.value) {
    return
  }
  emitProposal(history.value.propose([]))
  emit('clear')
  void nextTick(redraw)
}

function emitProposal(value: SignatureStroke[] | undefined) {
  if (!value) {
    return
  }
  emit('update:value', cloneStrokes(value))
  emit('change', cloneStrokes(value))
}

function undo() {
  if (canUndo.value) {
    emitProposal(history.value.undo())
  }
}

function redo() {
  if (canRedo.value) {
    emitProposal(history.value.redo())
  }
}

function initialize() {
  const owner = nativeInstance.$el as WechatMiniprogram.Component.TrivialInstance
  const query = nativeInstance.createSelectorQuery() ?? wx.createSelectorQuery().in(owner)
  query.select(`#${canvasId}`).fields({ node: true, size: true }, (result) => {
    if (disposed) { return }
    const canvas = result?.node as WechatMiniprogram.Canvas | undefined
    if (!canvas) { throw new Error('VSignature requires a mounted 2D canvas') }
    canvasWidth = Math.max(1, result.width)
    canvasHeight = Math.max(1, result.height)
    const ratio = Math.max(1, wx.getWindowInfo().pixelRatio)
    canvas.width = Math.round(canvasWidth * ratio)
    canvas.height = Math.round(canvasHeight * ratio)
    context = canvas.getContext('2d')
    context.scale(ratio, ratio)
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
  if (history.value.accept(value ?? [])) {
    triggerRef(history)
    touchCancel()
  }
}, { deep: true })
watch(() => props.historyLimit, (limit) => {
  history.value.setLimit(limit)
  triggerRef(history)
})
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
  disposed = true
  context = undefined
  clearTimeout(initializeTimer)
  wx.offWindowResize?.(scheduleInitialize)
})

defineExpose({ clear, undo, redo, canUndo, canRedo })
</script>

<template>
  <view :class="classes" :data-disabled="dataDisabled" :data-empty="dataEmpty">
    <canvas
      :id="canvasId"
      type="2d"
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
    <view v-if="props.showHistory || props.showClear" class="varo-signature__actions">
      <button
        v-if="props.showHistory"
        class="varo-signature__action varo-signature__undo"
        :disabled="!canUndo"
        @click="undo"
      >
        {{ props.undoText }}
      </button>
      <button
        v-if="props.showHistory"
        class="varo-signature__action varo-signature__redo"
        :disabled="!canRedo"
        @click="redo"
      >
        {{ props.redoText }}
      </button>
      <button
        v-if="props.showClear"
        class="varo-signature__action varo-signature__clear"
        :disabled="clearDisabled"
        @click="clear"
      >
        {{ props.clearText }}
      </button>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
