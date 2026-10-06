<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed, nextTick, onUnmounted, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'
import VIcon from './v-icon.vue'

type VToastPosition = 'top' | 'middle' | 'bottom'
type VToastType = 'text' | 'success' | 'warning' | 'danger' | 'loading'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    actionLabel?: string
    actionText?: string
    closeable?: boolean
    closeLabel?: string
    message?: string
    position?: VToastPosition
    type?: VToastType
    title?: string
    visible?: boolean
  }>(),
  {
    actionLabel: undefined,
    actionText: undefined,
    closeable: false,
    closeLabel: '关闭通知',
    message: '',
    position: 'middle',
    type: 'text',
    title: undefined,
    visible: false,
  },
)

const emit = defineEmits<{
  'action': []
  'close': []
  'update:visible': [visible: boolean]
}>()

type ToastTransitionPhase = 'idle' | 'enter-from' | 'enter-active' | 'leave-active' | 'leave-to'
const rendered = shallowRef(props.visible)
const phase = shallowRef<ToastTransitionPhase>('idle')
let transitionVersion = 0
const TRANSITION_SAFETY_TIMEOUT = 5000
let transitionSafetyTimer: ReturnType<typeof setTimeout> | undefined

function clearTransitionSafetyTimer() {
  if (transitionSafetyTimer === undefined) { return }
  clearTimeout(transitionSafetyTimer)
  transitionSafetyTimer = undefined
}

function finishTransition() {
  clearTransitionSafetyTimer()
  if (phase.value === 'enter-active' && props.visible) {
    phase.value = 'idle'
    return
  }
  if (phase.value === 'leave-to' && !props.visible) {
    rendered.value = false
    phase.value = 'idle'
  }
}

function scheduleTransitionSafety(version: number) {
  transitionSafetyTimer = setTimeout(() => {
    transitionSafetyTimer = undefined
    if (version === transitionVersion) { finishTransition() }
  }, TRANSITION_SAFETY_TIMEOUT)
}

async function enter() {
  transitionVersion += 1
  const version = transitionVersion
  clearTransitionSafetyTimer()
  rendered.value = true
  phase.value = 'enter-from'
  await nextTick()
  if (version !== transitionVersion || !props.visible) { return }
  phase.value = 'enter-active'
  scheduleTransitionSafety(version)
}

async function leave() {
  transitionVersion += 1
  const version = transitionVersion
  clearTransitionSafetyTimer()
  if (!rendered.value) {
    phase.value = 'idle'
    return
  }
  phase.value = 'leave-active'
  await nextTick()
  if (version !== transitionVersion || props.visible) { return }
  phase.value = 'leave-to'
  scheduleTransitionSafety(version)
}

function transitionFinish(event: unknown) {
  const nativeEvent = event as { currentTarget?: unknown, target?: unknown }
  if (nativeEvent.currentTarget && nativeEvent.target !== nativeEvent.currentTarget) { return }
  finishTransition()
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      void enter()
      return
    }
    void leave()
  },
  { immediate: true },
)

onUnmounted(() => {
  transitionVersion += 1
  clearTransitionSafetyTimer()
})

const transitionClasses = computed(() => {
  if (phase.value === 'enter-from') {
    return ['varo-toast-enter-active', 'varo-toast-enter-from']
  }
  if (phase.value === 'enter-active') { return 'varo-toast-enter-active' }
  if (phase.value === 'leave-active') { return 'varo-toast-leave-active' }
  if (phase.value === 'leave-to') {
    return ['varo-toast-leave-active', 'varo-toast-leave-to']
  }
  return undefined
})
const classes = computed(() => cn(
  'varo-toast',
  `varo-toast--${props.type}`,
  `varo-toast--${props.position}`,
  transitionClasses.value,
  props.className,
))
const role = computed(() => props.type === 'danger' || props.type === 'warning' ? 'alert' : 'status')
const ariaBusy = computed(() => props.type === 'loading' ? 'true' : undefined)
const ariaHidden = computed(() => props.visible ? undefined : 'true')
const ariaLive = computed(() => props.type === 'danger' || props.type === 'warning' ? 'assertive' : 'polite')
const iconName = computed(() => {
  if (props.type === 'success') { return 'success' }
  if (props.type === 'warning') { return 'warning' }
  if (props.type === 'danger') { return 'danger' }
  return 'info'
})

function close() {
  if (!props.visible) { return }
  emit('update:visible', false)
  emit('close')
}

function action() {
  if (props.visible) { emit('action') }
}
</script>

<template>
  <view
    v-if="rendered"
    :class="classes"
    :role="role"
    aria-atomic="true"
    :aria-hidden="ariaHidden"
    :aria-busy="ariaBusy"
    :aria-live="ariaLive"
    :data-type="props.type"
    :data-position="props.position"
    @transitionend="transitionFinish"
  >
    <view v-if="props.type !== 'text'" class="varo-toast__icon" aria-hidden="true">
      <view v-if="props.type === 'loading'" class="varo-toast__spinner">
        <view class="varo-toast__spinner-track" />
        <view class="varo-toast__spinner-arc" />
      </view>
      <VIcon v-else :name="iconName" :size="20" />
    </view>
    <view class="varo-toast__body">
      <text v-if="props.title" class="varo-toast__title">
        {{ props.title }}
      </text>
      <text class="varo-toast__message">
        <slot>{{ props.message }}</slot>
      </text>
    </view>
    <button
      v-if="props.actionText"
      :aria-label="props.actionLabel || props.actionText"
      :disabled="!props.visible"
      class="varo-toast__action"
      @click="action"
    >
      {{ props.actionText }}
    </button>
    <button
      v-if="props.closeable"
      :aria-label="props.closeLabel"
      :disabled="!props.visible"
      class="varo-toast__close"
      @click="close"
    >
      <VIcon name="close" :size="18" />
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
