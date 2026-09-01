<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

const props = withDefaults(
  defineProps<{
    atLiveEdge?: boolean
    className?: ClassValue
    followLabel?: string
    maxHeight?: number | string
  }>(),
  {
    atLiveEdge: true,
    followLabel: 'Jump to latest',
    maxHeight: 480,
  },
)

const emit = defineEmits<{
  'follow': []
  'update:atLiveEdge': [value: boolean]
}>()

const rootClass = computed(() =>
  cn('agent-message-scroller relative overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)]', props.className),
)
const rootStyle = computed(() => ({
  maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
}))

function follow() {
  emit('update:atLiveEdge', true)
  emit('follow')
}
</script>

<template>
  <view :class="rootClass" :style="rootStyle" :data-live-edge="String(atLiveEdge)">
    <scroll-view class="grid min-h-[180px] gap-3 overflow-y-auto p-3.5" scroll-y role="log" aria-live="polite">
      <slot />
    </scroll-view>
    <button
      v-if="!atLiveEdge"
      class="mx-auto mb-2.5 flex min-h-9 w-fit items-center justify-center rounded-full border border-[var(--varo-agent-border-strong)] bg-[var(--varo-agent-surface)] px-3 text-[12px] font-bold text-[var(--varo-agent-primary)] shadow-sm"
      type="button"
      @click="follow"
    >
      {{ followLabel }}
    </button>
  </view>
</template>

<style scoped>
.agent-message-scroller button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
