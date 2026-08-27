<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import { agentTableCellValue, type AgentTableColumn, type AgentTableRow } from './agent-table'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    columns?: AgentTableColumn[]
    rows?: AgentTableRow[]
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
  }>(),
  {
    columns: () => [],
    rows: () => [],
    sortBy: '',
    sortDirection: 'asc'
  }
)

const emit = defineEmits<{
  select: [row: AgentTableRow]
  sort: [column: AgentTableColumn]
}>()

const rootClass = computed(() =>
  cn('agent-records-table w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm', props.className)
)
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(1, props.columns.length)}, minmax(112px, 1fr))`
}))

function sortMark(column: AgentTableColumn) {
  if (props.sortBy !== column.key) return ''
  return props.sortDirection === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <scroll-view :class="rootClass" scroll-x :show-scrollbar="false">
    <view class="min-w-[560px]">
      <view class="grid border-b border-slate-200 bg-slate-50" :style="gridStyle" role="row">
        <view v-for="column in columns" :key="column.key" class="min-w-0 px-3 py-2.5" role="columnheader">
          <button v-if="column.sortable" class="inline-flex min-h-6 items-center gap-1 border-0 bg-transparent p-0 text-[9px] font-bold uppercase tracking-[.06em] text-slate-500" type="button" @click="emit('sort', column)">
            {{ column.label }} <text class="text-teal-700">{{ sortMark(column) }}</text>
          </button>
          <text v-else class="text-[9px] font-bold uppercase tracking-[.06em] text-slate-500">{{ column.label }}</text>
        </view>
      </view>
      <button v-for="row in rows" :key="row.id" class="grid min-h-11 w-full border-0 border-b border-slate-100 bg-white p-0 text-left last:border-b-0" hover-class="bg-slate-50" :hover-start-time="20" :hover-stay-time="70" :style="gridStyle" type="button" role="row" @click="emit('select', row)">
        <text v-for="column in columns" :key="column.key" class="truncate px-3 py-3 text-[11px] leading-4 text-slate-700" role="cell">{{ agentTableCellValue(row, column.key) }}</text>
      </button>
      <view v-if="!rows.length" class="grid min-h-24 place-items-center text-[11px] text-slate-400">No records</view>
    </view>
  </scroll-view>
</template>

<style scoped>
.agent-records-table button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
