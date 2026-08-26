<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentInsightItem } from './advanced-types'
import { agentChevronDownIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    current?: number
    insights?: AgentInsightItem[]
    title?: string
  }>(),
  {
    current: 0,
    insights: () => [],
    title: 'Insights'
  }
)

const emit = defineEmits<{
  action: [item: AgentInsightItem]
  'update:current': [value: number]
}>()

const active = computed(() =>
  props.insights[Math.min(Math.max(0, props.current), Math.max(0, props.insights.length - 1))]
)
const rootClass = computed(() =>
  cn(
    'agent-insight-card overflow-hidden rounded-2xl border bg-white shadow-sm',
    active.value?.tone === 'success' && 'border-green-200',
    active.value?.tone === 'warning' && 'border-amber-200',
    active.value?.tone === 'danger' && 'border-red-200',
    (!active.value?.tone || active.value.tone === 'default') && 'border-slate-200',
    props.className
  )
)
const activeTone = computed(() => active.value?.tone || 'default')

function move(delta: number) {
  if (!props.insights.length) return
  emit('update:current', (props.current + delta + props.insights.length) % props.insights.length)
}
</script>

<template>
  <view :class="rootClass" :data-tone="activeTone">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-[13px]">
      <text class="text-xs font-bold text-slate-800">{{ title }}</text>
      <text class="text-[10px] tabular-nums text-slate-400">{{ insights.length ? current + 1 : 0 }}/{{ insights.length }}</text>
    </view>

    <view v-if="active" class="relative grid min-h-32 place-content-center gap-2 px-5 py-5 text-center">
      <text v-if="active.label" class="text-[9px] font-bold uppercase tracking-[.1em] text-slate-400">{{ active.label }}</text>
      <text class="max-w-[520px] text-[15px] font-bold leading-6 text-slate-800">{{ active.description }}</text>
      <text v-if="active.value" class="text-2xl font-black tabular-nums text-teal-700">{{ active.value }}</text>
    </view>
    <view v-else class="grid min-h-32 place-items-center text-[11px] text-slate-400">No insights</view>

    <view class="flex min-h-12 items-center justify-between gap-3 border-t border-slate-100 px-3">
      <view class="flex gap-1.5">
        <button class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white" type="button" aria-label="Previous insight" @click="move(-1)">
          <image class="h-3.5 w-3.5 rotate-90" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
        </button>
        <button class="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white" type="button" aria-label="Next insight" @click="move(1)">
          <image class="h-3.5 w-3.5 -rotate-90" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
        </button>
      </view>
      <button v-if="active?.action" class="min-h-8 rounded-lg border border-teal-700 bg-teal-700 px-3 text-[10px] font-bold text-white" type="button" @click="emit('action', active)">{{ active.action }}</button>
    </view>
  </view>
</template>

<style scoped>
.agent-insight-card button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
