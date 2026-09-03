<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, onMounted, onPageScroll, shallowRef, useElementIntersectionObserver, watch } from 'wevu'
import { cn } from '../../lib/cn'

type StickyDimension = number | string

interface StickyScrollEvent {
  isFixed: boolean
  scrollTop: number
}

interface StickyIntersectionResult {
  boundingClientRect?: {
    top?: number
  }
}

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    disabled?: boolean
    offsetTop?: StickyDimension
    zIndex?: StickyDimension
  }>(),
  {
    disabled: false,
    offsetTop: 0,
    zIndex: undefined,
  },
)

const emit = defineEmits<{
  change: [fixed: boolean]
  scroll: [event: StickyScrollEvent]
}>()

const fixed = shallowRef(false)
const numericOffsetTop = computed(() => {
  const value = Number(props.offsetTop)
  return Number.isFinite(value) ? value : 0
})
const classes = computed(() => cn(
  'varo-sticky',
  props.disabled && 'disabled-true',
  props.className,
))
const dataDisabled = computed(() => String(props.disabled))
const dataFixed = computed(() => String(fixed.value))
const dataOffsetTop = computed(() => String(props.offsetTop))
const observerEnabled = computed(() => !props.disabled)
const sentinelStyle = computed(() => (
  `height: 1px; margin-bottom: -1px; position: relative; top: ${-numericOffsetTop.value}px; visibility: hidden; width: 1px;`
))
const stickyStyle = computed<Record<string, number | string | undefined>>(() => ({
  position: props.disabled ? undefined : 'sticky',
  top: normalizeSize(props.offsetTop),
  zIndex: props.zIndex,
}))

function normalizeSize(value: StickyDimension | undefined) {
  if (value === undefined || value === '') {
    return undefined
  }
  return typeof value === 'number' ? `${value}px` : value
}

function setFixed(nextFixed: boolean) {
  const next = props.disabled ? false : nextFixed
  if (next === fixed.value) {
    return
  }
  fixed.value = next
  emit('change', next)
}

function emitScroll(scrollTop: number) {
  emit('scroll', {
    isFixed: fixed.value,
    scrollTop,
  })
}

useElementIntersectionObserver<StickyIntersectionResult>({
  enabled: observerEnabled,
  relativeToViewport: true,
  selector: '.varo-sticky__sentinel',
  onObserve(result) {
    const rect = result.boundingClientRect
    if (rect === undefined || typeof rect.top !== 'number') {
      return
    }
    setFixed(rect.top <= 0)
  },
})

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      setFixed(false)
    }
  },
)

onMounted(() => {
  emitScroll(0)
})

onPageScroll((event) => {
  const scrollTop = Number(event.scrollTop)
  emitScroll(Number.isFinite(scrollTop) ? scrollTop : 0)
})
</script>

<template>
  <block>
    <view
      class="varo-sticky__sentinel"
      aria-hidden="true"
      :style="sentinelStyle"
    />
    <view
      :class="classes"
      :data-disabled="dataDisabled"
      :data-fixed="dataFixed"
      :data-offset-top="dataOffsetTop"
      :style="stickyStyle"
    >
      <slot :fixed="fixed" />
    </view>
  </block>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
