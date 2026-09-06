<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentTableColumn, AgentTableRow } from './agent-table'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentTableCellValue } from './agent-table'

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
    title: 'Proposed changes',
  },
)

const emit = defineEmits<{
  accept: []
  reject: []
  select: [row: AgentTableRow]
}>()

const rootClass = computed(() =>
  cn('agent-diff-table overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm', props.className),
)
const gridStyle = computed(() => ({
  gridTemplateColumns: `64px repeat(${Math.max(1, props.columns.length)}, minmax(112px, 1fr))`,
}))

function changeClass(change: DiffTableRow['change']) {
  return cn(
    'agent-native-button--block grid min-h-11 border-0 border-b border-[var(--varo-agent-border)] p-0 text-left last:border-b-0',
    change === 'add' && 'bg-[var(--varo-agent-success-soft)]',
    change === 'remove' && 'bg-[var(--varo-agent-danger-soft)]',
    (!change || change === 'update') && 'bg-[var(--varo-agent-surface)]',
  )
}

function changeMarker(change: DiffTableRow['change']) {
  if (change === 'add') { return '+' }
  if (change === 'remove') { return '−' }
  return '~'
}

function changeMarkerClass(change: DiffTableRow['change']) {
  return cn(
    'px-3 py-3 text-[12px] font-black',
    change === 'add' && 'text-[var(--varo-agent-success)]',
    change === 'remove' && 'text-[var(--varo-agent-danger)]',
    (!change || change === 'update') && 'text-[var(--varo-agent-warning)]',
  )
}
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-[13px]">
      <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text class="text-[11px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ rows.length }} rows
      </text>
    </view>

    <scroll-view scroll-x :show-scrollbar="false">
      <view class="min-w-[620px]">
        <view class="grid border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)]" :style="gridStyle" role="row">
          <text class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--varo-agent-text)]">
            Change
          </text>
          <text v-for="column in columns" :key="column.key" class="px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.06em] text-[var(--varo-agent-text)]">
            {{ column.label }}
          </text>
        </view>
        <button v-for="row in rows" :key="row.id" class="agent-native-button" :class="changeClass(row.change)" :style="gridStyle" type="button" :data-change="row.change || 'update'" @click="emit('select', row)">
          <text :class="changeMarkerClass(row.change)">
            {{ changeMarker(row.change) }}
          </text>
          <text v-for="column in columns" :key="column.key" :class="cn('truncate px-3 py-3 text-[12px] text-[var(--varo-agent-foreground)]', row.change === 'remove' && 'line-through')">
            {{ agentTableCellValue(row, column.key) }}
          </text>
        </button>
      </view>
    </scroll-view>

    <view class="flex min-h-12 items-center justify-end gap-2 border-t border-[var(--varo-agent-border)] px-3">
      <button class="agent-native-button min-h-9 rounded-[10px] border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-3 text-[11px] font-bold text-[var(--varo-agent-text)]" type="button" @click="emit('reject')">
        Reject
      </button>
      <button class="agent-native-button min-h-9 rounded-[10px] border border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] px-3 text-[11px] font-bold text-[var(--varo-agent-primary-foreground)]" type="button" @click="emit('accept')">
        Accept changes
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-diff-table button::after {
  border: 0;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
