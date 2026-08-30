<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentTraceStep } from './types'
import { computed, shallowRef, watch } from 'wevu'
import { cn } from '../../lib/cn'
import { agentChevronDownIcon as chevronIcon, agentSparklesIcon as thinkingIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    defaultOpen?: boolean
    label?: string
    open?: boolean
    steps?: AgentTraceStep[]
    streaming?: boolean
  }>(),
  {
    defaultOpen: false,
    label: '思考过程',
    open: undefined,
    steps: () => [],
    streaming: false,
  },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const internalOpen = shallowRef(props.open ?? (props.defaultOpen || props.streaming))
const manuallyToggled = shallowRef(false)
const currentOpen = computed(() => props.open ?? internalOpen.value)
const completedCount = computed(() => props.steps.filter(step => step.status === 'completed').length)
watch(() => props.streaming, (streaming) => {
  if (props.open === undefined && !manuallyToggled.value) {
    internalOpen.value = streaming
  }
})
const rootClass = computed(() =>
  cn(
    'agent-thinking overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm',
    currentOpen.value && 'agent-thinking--open',
    props.className,
  ),
)

function toggle() {
  manuallyToggled.value = true
  const open = !currentOpen.value
  internalOpen.value = open
  emit('update:open', open)
}

function dotClass(status: AgentTraceStep['status']) {
  return cn(
    'agent-thinking__dot absolute left-[-5px] top-[15px] box-border h-[9px] w-[9px] rounded-full border-2 border-slate-50',
    status === 'completed' && 'bg-green-600',
    status === 'running' && 'agent-thinking__running bg-teal-700 shadow-[0_0_0_3px_#ccfbf1]',
    status === 'failed' && 'bg-red-600',
    status === 'waiting' && 'bg-slate-300',
  )
}

function durationLabel(step: AgentTraceStep) {
  if (step.duration) { return step.duration }
  return step.durationMs === undefined ? '' : `${(step.durationMs / 1000).toFixed(1)}s`
}

function detailText(step: AgentTraceStep) {
  return step.detail ?? step.content ?? ''
}
</script>

<template>
  <view :class="rootClass" :data-open="String(currentOpen)">
    <button
      class="agent-thinking__trigger box-border flex min-h-16 w-full items-center gap-3 border-0 bg-white px-[15px] py-2.5 text-left text-slate-950"
      type="button"
      :aria-expanded="currentOpen"
      @click="toggle"
    >
      <view class="agent-thinking__icon grid h-[34px] w-[34px] flex-none place-items-center rounded-[11px] border border-teal-100 bg-emerald-50 shadow-[0_4px_12px_rgba(15,118,110,.1)]" aria-hidden="true">
        <image class="h-[19px] w-[19px]" :src="thinkingIcon" mode="aspectFit" />
      </view>
      <view class="grid min-w-0 flex-1 gap-0.5">
        <text class="truncate text-[13px] font-bold leading-[18px] text-slate-950">
          {{ label }}
        </text>
        <text class="text-[11px] leading-4 text-slate-500">
          {{ completedCount }}/{{ steps.length }} 已完成
        </text>
      </view>
      <image class="agent-thinking__chevron h-[17px] w-[17px] flex-none" :src="chevronIcon" mode="aspectFit" aria-hidden="true" />
    </button>

    <view v-if="currentOpen" class="grid border-t border-slate-200 bg-slate-50 pb-[13px] pl-[31px] pr-[15px] pt-[5px]">
      <view v-for="step in steps" :key="step.id" class="relative flex min-h-[45px] gap-3 border-l border-slate-300 py-[9px] pl-5" :data-status="step.status">
        <text :class="dotClass(step.status)" aria-hidden="true" />
        <view class="grid min-w-0 flex-1 gap-[3px]">
          <view class="flex items-center justify-between gap-2.5">
            <text class="text-xs font-semibold leading-[17px] text-slate-800">
              {{ step.title }}
            </text>
            <text v-if="durationLabel(step)" class="text-[11px] leading-4 text-slate-500">
              {{ durationLabel(step) }}
            </text>
          </view>
          <text v-if="detailText(step)" class="text-[11px] leading-4 text-slate-500">
            {{ detailText(step) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style>
.agent-thinking__trigger::after {
  border: 0;
}

.agent-thinking__chevron {
  transition: transform var(--varo-ui-motion-move, 200ms) var(--varo-ui-ease-move, ease-in-out);
}

.agent-thinking--open .agent-thinking__chevron {
  transform: rotate(180deg);
}

.agent-thinking__running {
  animation: agent-thinking-pulse 1.1s ease-in-out infinite;
}

@keyframes agent-thinking-pulse {
  50% {
    opacity: 0.55;
    transform: scale(0.72);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-thinking__running {
    animation: none;
  }

  .agent-thinking__chevron {
    transition: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
