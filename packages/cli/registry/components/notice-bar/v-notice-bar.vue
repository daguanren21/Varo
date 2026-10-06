<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import VIcon from './v-icon.vue'

type NoticeBarTone = 'info' | 'success' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    closeable?: boolean
    icon?: string
    scrollable?: boolean
    text?: string
    tone?: NoticeBarTone
    visible?: boolean
    wrapable?: boolean
  }>(),
  {
    closeable: false,
    icon: 'info',
    scrollable: false,
    tone: 'warning',
    visible: true,
    wrapable: false,
  },
)
const emit = defineEmits<{
  close: [event: unknown]
  'update:visible': [visible: boolean]
}>()

const contentClasses = computed(() =>
  cn(
    'varo-notice-bar__content',
    props.scrollable && !props.wrapable && 'varo-notice-bar__content--scrolling',
  ),
)
const rootClasses = computed(() => cn('varo-notice-bar', props.className))

function close(event: unknown) {
  emit('update:visible', false)
  emit('close', event)
}
</script>

<template>
  <view
    v-if="props.visible"
    :class="rootClasses"
    role="status"
    :data-scrollable="String(props.scrollable)"
    :data-tone="props.tone"
    :data-wrapable="String(props.wrapable)"
  >
    <slot name="icon">
      <VIcon class-name="varo-notice-bar__icon" :name="props.icon" :size="16" />
    </slot>
    <view class="varo-notice-bar__viewport">
      <view :class="contentClasses">
        <slot>{{ props.text }}</slot>
      </view>
    </view>
    <slot name="action">
      <button
        v-if="props.closeable"
        class="varo-notice-bar__close"
        type="button"
        aria-label="Close notice"
        @click="close"
      >
        <VIcon name="close" :size="14" />
      </button>
    </slot>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
