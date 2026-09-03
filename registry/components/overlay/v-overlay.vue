<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { useOverlayRoot } from '@varo-ui/headless'
import { computed, toRef } from 'wevu'
import { cn } from '../../lib/cn'
import { varoReactiveRuntime } from '../../lib/varo-primitives'

type OverlayDimension = number | string

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    closeOnClickOverlay?: boolean
    defaultVisible?: boolean
    disabled?: boolean
    duration?: OverlayDimension
    lockScroll?: boolean
    visible?: boolean
    zIndex?: OverlayDimension
  }>(),
  {
    closeOnClickOverlay: true,
    defaultVisible: false,
    disabled: undefined,
    duration: undefined,
    lockScroll: false,
    visible: undefined,
    zIndex: undefined,
  },
)

const emit = defineEmits<{
  click: [event: unknown]
  close: []
  visibleChange: [visible: boolean]
  'update:visible': [visible: boolean]
}>()

const visibleControlled = computed<boolean | undefined>(() => props.visible === undefined ? undefined : true)
const overlay = useOverlayRoot({
  runtime: varoReactiveRuntime,
  defaultVisible: props.defaultVisible,
  visible: toRef(props, 'visible'),
  visibleControlled,
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

const currentVisible = computed(() => overlay.state.visible.value)
const lockedVisible = computed(() => currentVisible.value && props.lockScroll)
const classes = computed(() => cn('varo-overlay', props.disabled && 'disabled-true', props.className))
const dataState = computed(() => currentVisible.value ? 'open' : 'closed')
const dataLockScroll = computed(() => String(props.lockScroll))
const rootStyle = computed(() => {
  const declarations: string[] = []
  if (props.zIndex != null && props.zIndex !== '') {
    declarations.push(`z-index: ${props.zIndex}`)
  }

  const duration = normalizeDuration(props.duration)
  if (duration !== undefined) {
    declarations.push(`--varo-overlay-duration: ${duration}`)
  }

  return declarations.join('; ')
})

function normalizeDuration(value: OverlayDimension | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}s` : value
}

function click(event: unknown) {
  emit('click', event)
  overlay.events.onOverlayClick()
}

function lockTouchMove() {
  return false
}
</script>

<template>
  <view
    v-if="lockedVisible"
    :class="classes"
    aria-hidden="true"
    :data-lock-scroll="dataLockScroll"
    :data-state="dataState"
    :style="rootStyle"
    @touchmove.stop="lockTouchMove"
    @click="click"
  >
    <slot />
  </view>
  <view
    v-else-if="currentVisible"
    :class="classes"
    aria-hidden="true"
    :data-lock-scroll="dataLockScroll"
    :data-state="dataState"
    :style="rootStyle"
    @click="click"
  >
    <slot />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
