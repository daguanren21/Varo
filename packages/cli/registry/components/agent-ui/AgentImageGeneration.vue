<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import { agentImageIcon as imageIcon } from './agent-icons'

type ImageGenerationStatus = 'completed' | 'failed' | 'generating' | 'queued'

const props = withDefaults(
  defineProps<{
    alt?: string
    className?: ClassValue
    progress?: number
    prompt?: string
    src?: string
    status?: ImageGenerationStatus
  }>(),
  {
    alt: 'Generated image',
    progress: 0,
    status: 'queued'
  }
)

const emit = defineEmits<{
  download: [src: string]
  retry: []
}>()

const progressValue = computed(() => Math.min(100, Math.max(0, props.progress)))
const rootClass = computed(() =>
  cn('agent-image-generation overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className)
)
const statusCopy = computed(() => {
  if (props.status === 'queued') return { detail: 'Waiting for a generation slot', label: 'Queued' }
  if (props.status === 'failed') return { detail: 'The image could not be generated', label: 'Generation failed' }
  if (props.status === 'completed') return { detail: 'Ready to review', label: 'Image complete' }
  return { detail: `${progressValue.value}% · Rendering details`, label: 'Refining image' }
})
const hasAction = computed(() =>
  props.status === 'failed' || (props.status === 'completed' && Boolean(props.src))
)
</script>

<template>
  <view :class="rootClass" :data-status="status">
    <view class="agent-image-generation__canvas relative grid min-h-[252px] place-items-center overflow-hidden">
      <image v-if="src" class="block h-full min-h-[252px] w-full object-cover" :src="src" :alt="alt" mode="aspectFill" />
      <view v-else class="relative z-10 grid place-items-center gap-3 text-center text-slate-500">
        <view class="agent-image-generation__preview relative grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-[20px] border border-teal-700/20 bg-white/80 shadow-[0_18px_34px_rgba(15,118,110,.13)]" aria-hidden="true">
          <text class="absolute h-[46px] w-[46px] rounded-2xl bg-teal-300/15 blur-lg" />
          <image class="relative z-[2] h-[34px] w-[34px]" :src="imageIcon" mode="aspectFit" />
          <text v-if="status === 'generating'" class="agent-image-generation__scan" />
        </view>
        <view class="grid gap-[3px]">
          <text class="text-[13px] font-bold leading-[18px] text-slate-700">{{ statusCopy.label }}</text>
          <text class="text-[10.5px] leading-[15px] text-slate-500">{{ statusCopy.detail }}</text>
        </view>
      </view>

      <view v-if="status === 'generating'" class="absolute inset-x-3.5 bottom-[13px] z-[2] grid gap-1.5">
        <view class="flex items-center justify-between text-[9px] text-slate-500">
          <text class="font-semibold tracking-[.03em]">Generation progress</text>
          <text class="text-[10px] font-bold tabular-nums text-teal-700">{{ progressValue }}%</text>
        </view>
        <view class="block h-[5px] overflow-hidden rounded-full bg-white/80">
          <text class="agent-image-generation__track block h-full rounded-full bg-gradient-to-r from-teal-700 to-teal-300" :style="{ width: `${progressValue}%` }" />
        </view>
      </view>
    </view>

    <view v-if="prompt" class="grid gap-[3px] border-t border-slate-200 px-3.5 py-3">
      <text class="text-[8.5px] font-bold uppercase leading-3 tracking-[.12em] text-slate-400">Prompt</text>
      <text class="text-[11px] leading-4 text-slate-700">{{ prompt }}</text>
    </view>

    <view v-if="hasAction" class="flex min-h-12 items-center justify-end gap-2 border-t border-slate-100 px-3">
      <button v-if="status === 'failed'" class="min-h-[34px] rounded-[10px] border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600" type="button" @click="emit('retry')">Retry</button>
      <button v-if="status === 'completed' && src" class="min-h-[34px] rounded-[10px] border border-teal-700 bg-teal-700 px-3 text-[10px] font-bold text-white" type="button" @click="emit('download', src)">Download</button>
    </view>
  </view>
</template>

<style scoped>
.agent-image-generation__canvas {
  background:
    radial-gradient(circle at 50% 38%, rgba(45, 212, 191, .16), transparent 34%),
    linear-gradient(145deg, #f4f7fb, #e8eef5);
}
.agent-image-generation__canvas::before {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(100, 116, 139, .055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 116, 139, .055) 1px, transparent 1px);
  background-size: 24px 24px;
  content: '';
  pointer-events: none;
}
.agent-image-generation__scan {
  position: absolute;
  z-index: 3;
  right: 10px;
  left: 10px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #14b8a6, transparent);
  box-shadow: 0 0 10px rgba(20, 184, 166, .45);
  animation: agent-image-scan 1.8s ease-in-out infinite;
}
.agent-image-generation__track { box-shadow: 0 0 12px rgba(20,184,166,.28); transition: width 280ms ease; }
.agent-image-generation button::after { border: 0; }
@keyframes agent-image-scan {
  0%, 100% { top: 15px; opacity: .35; }
  50% { top: 56px; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .agent-image-generation__scan { animation: none; top: 35px; }
  .agent-image-generation__track { transition: none; }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
