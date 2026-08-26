<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import { agentTableCellValue, type AgentTableColumn, type AgentTableRow } from './agent-table'

type DiffTableRow = AgentTableRow & { change?: 'add' | 'remove' | 'update' }

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    columns?: AgentTableColumn[]
    rows?: DiffTableRow[]
    title?: string
  }>(),
  {
    columns: () => [],
    rows: () => [],
    title: 'Proposed changes'
  }
)

const emit = defineEmits<{
  accept: []
  reject: []
  select: [row: AgentTableRow]
}>()

const rootClass = computed(() =>
  cn('agent-diff-table overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className)
)
const gridStyle = computed(() => ({
  gridTemplateColumns: `64px repeat(${Math.max(1, props.columns.length)}, minmax(112px, 1fr))`
}))

function changeClass(change: DiffTableRow['change']) {
  return cn(
    'grid min-h-11 w-full border-0 border-b border-slate-100 p-0 text-left last:border-b-0',
    change === 'add' && 'bg-green-50',
    change === 'remove' && 'bg-red-50',
    (!change || change === 'update') && 'bg-white'
  )
}
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-slate-100 px-[13px]">
      <text class="text-xs font-bold text-slate-800">{{ title }}</text>
      <text class="text-[10px] tabular-nums text-slate-400">{{ rows.length }} rows</text>
    </view>

    <scroll-view scroll-x :show-scrollbar="false">
      <view class="min-w-[620px]">
        <view class="grid border-b border-slate-200 bg-slate-50" :style="gridStyle" role="row">
          <text class="px-3 py-2.5 text-[9px] font-bold uppercase tracking-[.06em] text-slate-500">Change</text>
          <text v-for="column in columns" :key="column.key" class="px-3 py-2.5 text-[9px] font-bold uppercase tracking-[.06em] text-slate-500">{{ column.label }}</text>
        </view>
        <button v-for="row in rows" :key="row.id" :class="changeClass(row.change)" :style="gridStyle" type="button" :data-change="row.change || 'update'" @click="emit('select', row)">
          <text :class="cn('px-3 py-3 text-[11px] font-black', row.change === 'add' ? 'text-green-700' : row.change === 'remove' ? 'text-red-600' : 'text-amber-600')">{{ row.change === 'add' ? '+' : row.change === 'remove' ? '−' : '~' }}</text>
          <text v-for="column in columns" :key="column.key" :class="cn('truncate px-3 py-3 text-[11px] text-slate-700', row.change === 'remove' && 'line-through')">{{ agentTableCellValue(row, column.key) }}</text>
        </button>
      </view>
    </scroll-view>

    <view class="flex min-h-12 items-center justify-end gap-2 border-t border-slate-100 px-3">
      <button class="min-h-[34px] rounded-[10px] border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600" type="button" @click="emit('reject')">Reject</button>
      <button class="min-h-[34px] rounded-[10px] border border-teal-700 bg-teal-700 px-3 text-[10px] font-bold text-white" type="button" @click="emit('accept')">Accept changes</button>
    </view>
  </view>
</template>

<style scoped>
.agent-diff-table button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
