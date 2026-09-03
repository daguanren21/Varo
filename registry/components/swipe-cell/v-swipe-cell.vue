<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'

type SwipeCellOpenSide = 'left' | 'right'
type SwipeCellSide = SwipeCellOpenSide | null

interface MiniProgramTouch {
  clientX: number
}

interface MiniProgramTouchEvent {
  changedTouches?: ArrayLike<MiniProgramTouch>
  touches?: ArrayLike<MiniProgramTouch>
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    disabled?: boolean
    leftWidth?: number
    modelValue?: SwipeCellOpenSide
    rightWidth?: number
    threshold?: number
  }>(),
  {
    disabled: false,
    leftWidth: 0,
    modelValue: undefined,
    rightWidth: 0,
    threshold: 0.3,
  },
)

const emit = defineEmits<{
  close: []
  open: [side: SwipeCellOpenSide]
  'update:modelValue': [side: SwipeCellOpenSide | undefined]
}>()

const currentSide = shallowRef<SwipeCellSide>(props.modelValue ?? null)
const dragging = shallowRef(false)
const dragOffset = shallowRef(0)
const startOffset = shallowRef(0)
const startX = shallowRef(0)

const restingOffset = computed(() => {
  if (currentSide.value === 'left') {
    return props.leftWidth
  }
  if (currentSide.value === 'right') {
    return -props.rightWidth
  }
  return 0
})
const offset = computed(() => dragging.value ? dragOffset.value : restingOffset.value)
const classes = computed(() => cn('varo-swipe-cell', props.className))
const dataDragging = computed(() => String(dragging.value))
const dataOpen = computed(() => currentSide.value === null ? 'none' : currentSide.value)
const showLeftActions = computed(() => props.leftWidth > 0)
const showRightActions = computed(() => props.rightWidth > 0)
const leftStyle = computed(() => `width: ${props.leftWidth}px`)
const rightStyle = computed(() => `width: ${props.rightWidth}px`)
const contentStyle = computed(() => `transform: translate3d(${offset.value}px, 0, 0)`)

watch(
  () => props.modelValue,
  (side) => {
    currentSide.value = side ?? null
  },
)

function pointX(event: MiniProgramTouchEvent): number | undefined {
  const touches = event.touches
  if (touches && touches.length > 0) {
    const touch = touches[0]
    if (touch) {
      return touch.clientX
    }
  }

  const changedTouches = event.changedTouches
  if (changedTouches && changedTouches.length > 0) {
    const touch = changedTouches[0]
    if (touch) {
      return touch.clientX
    }
  }

  return undefined
}

function open(side: SwipeCellOpenSide) {
  currentSide.value = side
  emit('update:modelValue', side)
  emit('open', side)
}

function close() {
  currentSide.value = null
  emit('update:modelValue', undefined)
  emit('close')
}

function touchStart(event: MiniProgramTouchEvent) {
  if (props.disabled) {
    return
  }

  const x = pointX(event)
  if (x === undefined) {
    return
  }

  dragging.value = true
  startX.value = x
  startOffset.value = restingOffset.value
  dragOffset.value = restingOffset.value
}

function touchMove(event: MiniProgramTouchEvent) {
  if (!dragging.value || props.disabled) {
    return
  }

  const x = pointX(event)
  if (x === undefined) {
    return
  }

  dragOffset.value = Math.max(
    -props.rightWidth,
    Math.min(props.leftWidth, startOffset.value + x - startX.value),
  )
}

function touchEnd() {
  if (!dragging.value) {
    return
  }

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
</script>

<template>
  <view :class="classes" :data-dragging="dataDragging" :data-open="dataOpen">
    <view
      v-if="showLeftActions"
      class="varo-swipe-cell__actions varo-swipe-cell__actions--left"
      :style="leftStyle"
    >
      <slot name="left" :close="close" />
    </view>
    <view
      v-if="showRightActions"
      class="varo-swipe-cell__actions varo-swipe-cell__actions--right"
      :style="rightStyle"
    >
      <slot name="right" :close="close" />
    </view>
    <view
      class="varo-swipe-cell__content"
      :style="contentStyle"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
      @touchcancel="touchEnd"
    >
      <slot :close="close" :open="open" />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
