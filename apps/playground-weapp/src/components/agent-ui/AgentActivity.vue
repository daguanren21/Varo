<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentActivityItem, AgentAdvancedStatus } from './advanced-types'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    items?: AgentActivityItem[]
    title?: string
  }>(),
  {
    items: () => [],
    title: 'Agent activity'
  }
)

const rootClass = computed(() =>
  cn('agent-activity overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className)
)
const completedCount = computed(() => props.items.filter((item) => item.status === 'completed').length)

function statusClass(status: AgentAdvancedStatus) {
  return cn(
    'h-2 w-2 flex-none rounded-full',
    status === 'completed' && 'bg-green-600',
    status === 'running' && 'agent-activity__running bg-teal-700 shadow-[0_0_0_3px_#ccfbf1]',
    status === 'failed' && 'bg-red-600',
    status === 'waiting' && 'bg-slate-300'
  )
}

function kindLabel(kind: AgentActivityItem['kind']) {
  if (kind === 'reasoning') return 'R'
  if (kind === 'search') return 'S'
  if (kind === 'tool') return 'T'
  return '·'
}
</script>

<template>
  <view :class="rootClass" aria-live="polite">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 px-[13px]">
      <text class="text-xs font-bold text-slate-800">{{ title }}</text>
      <text class="text-[10px] tabular-nums text-slate-400">{{ completedCount }}/{{ items.length }}</text>
    </view>

    <view class="grid p-2">
      <view v-for="item in items" :key="item.id" class="grid min-h-[54px] grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-2.5 rounded-xl px-2 py-2" :data-kind="item.kind" :data-status="item.status">
        <text class="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-[9px] font-bold text-slate-500" aria-hidden="true">{{ kindLabel(item.kind) }}</text>
        <view class="grid min-w-0 gap-0.5">
          <view class="flex items-baseline justify-between gap-2">
            <text class="truncate text-[11px] font-semibold text-slate-700">{{ item.title }}</text>
            <text v-if="item.duration" class="flex-none text-[9px] tabular-nums text-slate-400">{{ item.duration }}</text>
          </view>
          <text v-if="item.detail" class="text-[10px] leading-4 text-slate-400">{{ item.detail }}</text>
        </view>
        <text :class="statusClass(item.status)" aria-hidden="true" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.agent-activity__running { animation: agent-activity-pulse 1s ease-in-out infinite; }
@keyframes agent-activity-pulse { 50% { opacity: .35; transform: scale(.72); } }
@media (prefers-reduced-motion: reduce) { .agent-activity__running { animation: none; } }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
