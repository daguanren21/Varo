<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import {
  agentTableCellValue,
  type AgentFilterOption,
  type AgentTableColumn,
  type AgentTableRow
} from './agent-table'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    columns?: AgentTableColumn[]
    filter?: string
    filters?: AgentFilterOption[]
    rows?: AgentTableRow[]
    statusKey?: string
  }>(),
  {
    columns: () => [],
    filter: 'all',
    filters: () => [],
    rows: () => [],
    statusKey: 'status'
  }
)

const emit = defineEmits<{
  select: [row: AgentTableRow]
  'update:filter': [value: string]
}>()

const rootClass = computed(() => cn('agent-filter-table grid gap-2.5', props.className))
const visibleRows = computed(() =>
  props.filter === 'all'
    ? props.rows
    : props.rows.filter((row) => row[props.statusKey] === props.filter)
)
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(1, props.columns.length)}, minmax(112px, 1fr))`
}))

function filterClass(value: string) {
  return cn(
    'inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 py-0 text-[10px] font-bold leading-none',
    value === props.filter
      ? 'border-teal-700 bg-emerald-50 text-teal-700'
      : 'border-slate-200 bg-white text-slate-500'
  )
}
</script>

<template>
  <view :class="rootClass">
    <view class="flex flex-wrap gap-2" role="navigation" aria-label="Table filters">
      <button
        v-for="item in filters"
        :key="item.value"
        :class="filterClass(item.value)"
        hover-class="border-teal-200 bg-teal-50"
        :hover-start-time="20"
        :hover-stay-time="70"
        type="button"
        :data-active="String(item.value === filter)"
        @click="emit('update:filter', item.value)"
      >
        <text>{{ item.label }}</text>
        <text
          v-if="item.count !== undefined"
          class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-100 px-1 text-[8px] leading-none tabular-nums"
        >
          {{ item.count }}
        </text>
      </button>
    </view>

    <scroll-view class="w-full overflow-hidden rounded-xl border border-slate-200 bg-white" scroll-x :show-scrollbar="false">
      <view class="min-w-[560px]">
        <view class="grid border-b border-slate-200 bg-slate-50" :style="gridStyle" role="row">
          <text v-for="column in columns" :key="column.key" class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.06em] text-slate-500" role="columnheader">
            {{ column.label }}
          </text>
        </view>
        <button
          v-for="row in visibleRows"
          :key="row.id"
          class="grid min-h-11 w-full border-0 border-b border-slate-100 bg-white p-0 text-left last:border-b-0"
          hover-class="bg-slate-50"
          :hover-start-time="20"
          :hover-stay-time="70"
          :style="gridStyle"
          type="button"
          role="row"
          @click="emit('select', row)"
        >
          <text v-for="column in columns" :key="column.key" class="truncate px-3 py-3 text-[11px] leading-4 text-slate-700" role="cell">
            {{ agentTableCellValue(row, column.key) }}
          </text>
        </button>
        <view v-if="!visibleRows.length" class="grid min-h-24 place-items-center text-[11px] text-slate-400">
          No matching records
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.agent-filter-table button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
