<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentFilterOption, AgentTableColumn, AgentTableRow } from './agent-table'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import {

  agentTableCellValue,

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
    statusKey: 'status',
  },
)

const emit = defineEmits<{
  'select': [row: AgentTableRow]
  'update:filter': [value: string]
}>()

const rootClass = computed(() => cn('agent-filter-table grid gap-2.5', props.className))
const visibleRows = computed(() =>
  props.filter === 'all'
    ? props.rows
    : props.rows.filter(row => row[props.statusKey] === props.filter),
)
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(1, props.columns.length)}, minmax(112px, 1fr))`,
}))

function filterClass(value: string) {
  return cn(
    'inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-0 text-[11px] font-bold leading-none',
    value === props.filter
      ? 'border-[var(--varo-agent-primary)] bg-[var(--varo-agent-success-soft)] text-[var(--varo-agent-primary)]'
      : 'border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] text-[var(--varo-agent-text)]',
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
        hover-class="border-[var(--varo-agent-border-strong)] bg-[var(--varo-agent-primary-soft)]"
        :hover-start-time="20"
        :hover-stay-time="70"
        type="button"
        :data-active="String(item.value === filter)"
        @click="emit('update:filter', item.value)"
      >
        <text>{{ item.label }}</text>
        <text
          v-if="item.count !== undefined"
          class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--varo-agent-fill)] px-1 text-[10px] leading-none tabular-nums"
        >
          {{ item.count }}
        </text>
      </button>
    </view>

    <scroll-view class="w-full overflow-hidden rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]" scroll-x :show-scrollbar="false">
      <view class="min-w-[560px]">
        <view class="grid border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)]" :style="gridStyle" role="row">
          <text v-for="column in columns" :key="column.key" class="px-3 py-2.5 text-[11px] font-bold uppercase tracking-[.06em] text-[var(--varo-agent-text)]" role="columnheader">
            {{ column.label }}
          </text>
        </view>
        <button
          v-for="row in visibleRows"
          :key="row.id"
          class="grid min-h-11 w-full border-0 border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-0 text-left last:border-b-0"
          hover-class="bg-[var(--varo-agent-surface-strong)]"
          :hover-start-time="20"
          :hover-stay-time="70"
          :style="gridStyle"
          type="button"
          role="row"
          @click="emit('select', row)"
        >
          <text v-for="column in columns" :key="column.key" class="truncate px-3 py-3 text-[12px] leading-4 text-[var(--varo-agent-foreground)]" role="cell">
            {{ agentTableCellValue(row, column.key) }}
          </text>
        </button>
        <view v-if="!visibleRows.length" class="grid min-h-24 place-items-center text-[12px] text-[var(--varo-agent-muted)]">
          No matching records
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.agent-filter-table button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
