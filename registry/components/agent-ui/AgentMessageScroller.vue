<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'

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
    maxHeight: 480
  }
)

const emit = defineEmits<{
  follow: []
  'update:atLiveEdge': [value: boolean]
}>()

const rootClass = computed(() =>
  cn('agent-message-scroller relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50', props.className)
)
const rootStyle = computed(() => ({
  maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
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
      class="mx-auto mb-2.5 flex min-h-[34px] w-fit items-center justify-center rounded-full border border-teal-200 bg-white px-3 text-[11px] font-bold text-teal-700 shadow-sm"
      type="button"
      @click="follow"
    >
      {{ followLabel }}
    </button>
  </view>
</template>

<style scoped>
.agent-message-scroller button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
