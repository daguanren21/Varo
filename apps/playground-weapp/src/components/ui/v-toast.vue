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
    closeable?: boolean
    closeLabel?: string
    message?: string
    position?: VToastPosition
    type?: VToastType
    visible?: boolean
  }>(),
  {
    closeable: true,
    closeLabel: '关闭通知',
    message: '',
    position: 'middle',
    type: 'text',
    visible: false,
  },
)

const emit = defineEmits<{
  close: []
  'update:visible': [visible: boolean]
}>()

type ToastTransitionPhase = 'idle' | 'enter-from' | 'enter-active' | 'leave-active' | 'leave-to'

const ENTER_DURATION = 220
const LEAVE_DURATION = 160
const rendered = shallowRef(props.visible)
const phase = shallowRef<ToastTransitionPhase>('idle')
let transitionTimer: ReturnType<typeof setTimeout> | undefined
let transitionVersion = 0

function clearTransitionTimer() {
  if (transitionTimer === undefined) { return }
  clearTimeout(transitionTimer)
  transitionTimer = undefined
}

async function enter() {
  transitionVersion += 1
  const version = transitionVersion
  clearTransitionTimer()
  rendered.value = true
  phase.value = 'enter-from'
  await nextTick()
  if (version !== transitionVersion || !props.visible) { return }

  phase.value = 'enter-active'
  transitionTimer = setTimeout(() => {
    transitionTimer = undefined
    if (version !== transitionVersion || !props.visible) { return }
    phase.value = 'idle'
  }, ENTER_DURATION)
}

async function leave() {
  transitionVersion += 1
  const version = transitionVersion
  clearTransitionTimer()
  if (!rendered.value) {
    phase.value = 'idle'
    return
  }

  phase.value = 'leave-active'
  await nextTick()
  if (version !== transitionVersion || props.visible) { return }

  phase.value = 'leave-to'
  transitionTimer = setTimeout(() => {
    transitionTimer = undefined
    if (version !== transitionVersion || props.visible) { return }
    rendered.value = false
    phase.value = 'idle'
  }, LEAVE_DURATION)
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
  clearTransitionTimer()
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
const classes = computed(() => cn('varo-toast', transitionClasses.value, props.className))
const role = computed(() => props.type === 'danger' || props.type === 'warning' ? 'alert' : 'status')
const ariaBusy = computed(() => props.type === 'loading' ? 'true' : undefined)
const ariaLive = computed(() => props.type === 'danger' || props.type === 'warning' ? 'assertive' : 'polite')
const iconName = computed(() => {
  if (props.type === 'success') { return 'success' }
  if (props.type === 'warning') { return 'warning' }
  if (props.type === 'danger') { return 'danger' }
  return 'info'
})

function close() {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <view
    v-if="rendered"
    :class="classes"
    :role="role"
    aria-atomic="true"
    :aria-busy="ariaBusy"
    :aria-live="ariaLive"
    :data-type="props.type"
    :data-position="props.position"
  >
    <view class="varo-toast__icon" aria-hidden="true">
      <view v-if="props.type === 'loading'" class="varo-toast__spinner">
        <view class="varo-toast__spinner-track" />
        <view class="varo-toast__spinner-arc" />
      </view>
      <VIcon v-else :name="iconName" :size="20" />
    </view>
    <text class="varo-toast__message">
      <slot>{{ props.message }}</slot>
    </text>
    <button
      v-if="props.closeable"
      :aria-label="props.closeLabel"
      class="varo-toast__close"
      @click="close"
    >
      <VIcon name="close" :size="18" />
    </button>
  </view>
</template>

<style scoped>
.varo-toast__spinner {
  position: relative;
  width: 20px;
  height: 20px;
}

.varo-toast__spinner-track,
.varo-toast__spinner-arc {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.varo-toast__spinner-arc {
  border-right-color: transparent;
  border-bottom-color: transparent;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
