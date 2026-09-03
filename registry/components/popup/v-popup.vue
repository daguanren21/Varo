<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { usePopupRoot } from '@varo-ui/headless'
import { computed, toRef } from 'wevu'
import { cn } from '../../lib/cn'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import VIcon from './v-icon.vue'
import VOverlay from './v-overlay.vue'

type PopupCloseIconPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type PopupDimension = number | string
type PopupPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    closeIcon?: string
    closeIconPosition?: PopupCloseIconPosition
    closeOnClickOverlay?: boolean
    closeable?: boolean
    defaultVisible?: boolean
    destroyOnClose?: boolean
    disabled?: boolean
    duration?: PopupDimension
    lockScroll?: boolean
    overlay?: boolean
    position?: PopupPosition
    round?: boolean
    safeAreaInsetBottom?: boolean
    visible?: boolean
    zIndex?: PopupDimension
  }>(),
  {
    closeIcon: '×',
    closeIconPosition: 'top-right',
    closeOnClickOverlay: true,
    closeable: false,
    defaultVisible: false,
    destroyOnClose: true,
    disabled: undefined,
    duration: undefined,
    lockScroll: false,
    overlay: true,
    position: 'bottom',
    round: false,
    safeAreaInsetBottom: false,
    visible: undefined,
    zIndex: undefined,
  },
)

const emit = defineEmits<{
  clickOverlay: []
  close: []
  visibleChange: [visible: boolean]
  'update:visible': [visible: boolean]
}>()

const visibleControlled = computed<boolean | undefined>(() => props.visible === undefined ? undefined : true)
const popup = usePopupRoot({
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

const currentVisible = computed(() => popup.state.visible.value)
const popupDisabled = computed(() => popup.state.disabled.value)
const shouldRender = computed(() => currentVisible.value || !props.destroyOnClose)
const lockedVisible = computed(() => currentVisible.value && props.lockScroll)
const showOverlay = computed(() => props.overlay && currentVisible.value)
const contentHidden = computed(() => !currentVisible.value)
const classes = computed(() =>
  cn(
    'varo-popup',
    `position-${props.position}`,
    props.round && 'round-true',
    props.closeable && 'closeable-true',
    props.className,
  ),
)
const dataState = computed(() => currentVisible.value ? 'open' : 'closed')
const dataRound = computed(() => String(props.round))
const dataSafeAreaInsetBottom = computed(() => String(props.safeAreaInsetBottom))
const closeIconName = computed(() => props.closeIcon === '×' ? 'close' : props.closeIcon)
const contentStyle = computed(() => {
  const declarations: string[] = []
  const zIndex = normalizeContentZIndex(props.zIndex)
  if (zIndex !== undefined) {
    declarations.push(`z-index: ${zIndex}`)
  }

  const duration = normalizeDuration(props.duration)
  if (duration !== undefined) {
    declarations.push(`--varo-popup-duration: ${duration}`)
  }

  return declarations.join('; ')
})

function normalizeDuration(value: PopupDimension | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}s` : value
}

function normalizeContentZIndex(value: PopupDimension | undefined) {
  if (value == null || value === '') {
    return undefined
  }

  if (typeof value === 'number') {
    return value + 1
  }

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue + 1 : value
}

function clickOverlay() {
  emit('clickOverlay')
  popup.events.onOverlayClick()
}

function close() {
  popup.events.close()
}

function lockTouchMove() {
  return false
}
</script>

<template>
  <view
    v-if="lockedVisible"
    :class="classes"
    :data-position="props.position"
    :data-state="dataState"
    @touchmove.stop="lockTouchMove"
  >
    <VOverlay
      v-if="showOverlay"
      class-name="varo-popup__overlay"
      :close-on-click-overlay="false"
      :duration="props.duration"
      :lock-scroll="props.lockScroll"
      :visible="currentVisible"
      :z-index="props.zIndex"
      @click="clickOverlay"
    />
    <view
      id="varo-popup-content"
      class="varo-popup__content"
      role="dialog"
      tabindex="-1"
      :hidden="contentHidden"
      :data-position="props.position"
      :data-round="dataRound"
      :data-safe-area-inset-bottom="dataSafeAreaInsetBottom"
      :data-state="dataState"
      :style="contentStyle"
    >
      <slot />
      <button
        v-if="props.closeable"
        class="varo-popup__close"
        type="button"
        aria-label="Close popup"
        :data-position="props.closeIconPosition"
        :disabled="popupDisabled"
        @click="close"
      >
        <slot name="closeIcon"><VIcon :name="closeIconName" /></slot>
      </button>
    </view>
  </view>
  <view
    v-else-if="shouldRender"
    :class="classes"
    :data-position="props.position"
    :data-state="dataState"
  >
    <VOverlay
      v-if="showOverlay"
      class-name="varo-popup__overlay"
      :close-on-click-overlay="false"
      :duration="props.duration"
      :lock-scroll="props.lockScroll"
      :visible="currentVisible"
      :z-index="props.zIndex"
      @click="clickOverlay"
    />
    <view
      id="varo-popup-content"
      class="varo-popup__content"
      role="dialog"
      tabindex="-1"
      :hidden="contentHidden"
      :data-position="props.position"
      :data-round="dataRound"
      :data-safe-area-inset-bottom="dataSafeAreaInsetBottom"
      :data-state="dataState"
      :style="contentStyle"
    >
      <slot />
      <button
        v-if="props.closeable"
        class="varo-popup__close"
        type="button"
        aria-label="Close popup"
        :data-position="props.closeIconPosition"
        :disabled="popupDisabled"
        @click="close"
      >
        <slot name="closeIcon"><VIcon :name="closeIconName" /></slot>
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
