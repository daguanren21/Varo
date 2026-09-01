<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentTableColumn, AgentTableRow } from './agent-table'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentTableCellValue } from './agent-table'

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
    sortDirection: 'asc',
  },
)

const emit = defineEmits<{
  select: [row: AgentTableRow]
  sort: [column: AgentTableColumn]
}>()

const rootClass = computed(() =>
  cn('agent-records-table w-full overflow-hidden rounded-xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
)
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.max(1, props.columns.length)}, minmax(112px, 1fr))`,
}))

function sortMark(column: AgentTableColumn) {
  if (props.sortBy !== column.key) { return '' }
  return props.sortDirection === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <scroll-view :class="rootClass" scroll-x :show-scrollbar="false">
    <view class="min-w-[560px]">
      <view class="grid border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)]" :style="gridStyle" role="row">
        <view v-for="column in columns" :key="column.key" class="min-w-0 px-3 py-2.5" role="columnheader">
          <button v-if="column.sortable" class="inline-flex min-h-6 items-center gap-1 border-0 bg-transparent p-0 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--varo-agent-text)]" type="button" @click="emit('sort', column)">
            {{ column.label }} <text class="text-[var(--varo-agent-primary)]">
              {{ sortMark(column) }}
            </text>
          </button>
          <text v-else class="text-[10px] font-bold uppercase tracking-[.06em] text-[var(--varo-agent-text)]">
            {{ column.label }}
          </text>
        </view>
      </view>
      <button v-for="row in rows" :key="row.id" class="grid min-h-11 w-full border-0 border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-0 text-left last:border-b-0" hover-class="bg-[var(--varo-agent-surface-strong)]" :hover-start-time="20" :hover-stay-time="70" :style="gridStyle" type="button" role="row" @click="emit('select', row)">
        <text v-for="column in columns" :key="column.key" class="truncate px-3 py-3 text-[12px] leading-4 text-[var(--varo-agent-foreground)]" role="cell">
          {{ agentTableCellValue(row, column.key) }}
        </text>
      </button>
      <view v-if="!rows.length" class="grid min-h-24 place-items-center text-[12px] text-[var(--varo-agent-muted)]">
        No records
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.agent-records-table button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
