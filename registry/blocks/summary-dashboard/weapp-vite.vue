<script setup lang="ts">
import type { SummaryIntent, SummaryMetric, SummaryPeriod, SummaryRow } from './summary-dashboard-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { canSelectSummaryPeriod } from './summary-dashboard-actions'

defineOptions({
  properties: {
    metrics: { type: Array, value: [] },
    summaries: { type: Array, value: [] },
    periods: { type: Array, value: [] },
  },
})
const props = withDefaults(defineProps<{ metrics: SummaryMetric[], summaries: SummaryRow[], periods: SummaryPeriod[], period: string, title?: string, loading?: boolean, disabled?: boolean, error?: string, canRetry?: boolean }>(), { metrics: () => [], summaries: () => [], periods: () => [], period: '', title: 'Summary', loading: false, disabled: false, error: '', canRetry: false })
const emit = defineEmits<{ intent: [intent: SummaryIntent] }>()
const choices = computed(() => props.periods.map(item => ({ ...item, selected: item.id === props.period, label: `Period: ${item.label}`, locked: !canSelectSummaryPeriod(props.periods, props.period, item.id, props.loading || props.disabled) })))
function request(intent: SummaryIntent) {
  if (intent.action === 'period') {
    if (!canSelectSummaryPeriod(props.periods, props.period, intent.id, props.loading || props.disabled)) { return }
  }
  else if (!props.error || !props.canRetry || props.loading || props.disabled) {
    return
  }
  emit('intent', intent)
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <view class="flex flex-wrap gap-2" role="group" aria-label="Summary period">
      <VButton v-for="choice in choices" :key="choice.id" variant="outline" :aria-label="choice.label" :aria-pressed="choice.selected" :disabled="choice.locked" @click="request({ action: 'period', id: choice.id })">
        {{ choice.label }}<text v-if="choice.selected">
          (selected)
        </text>
      </VButton>
    </view>
    <text v-if="loading" role="status">
      Loading summary…
    </text>
    <view v-if="error">
      <text class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
        {{ error }}
      </text><VButton v-if="canRetry" variant="outline" :disabled="loading || disabled" @click="request({ action: 'retry' })">
        Retry summary
      </VButton>
    </view>
    <text v-if="!metrics.length && !summaries.length && !loading" role="status">
      No summary data
    </text>
    <view class="grid grid-cols-1 gap-3">
      <view v-for="metric in metrics" :key="metric.id" class="min-w-0 border-b border-[var(--varo-ui-border-lighter)] pb-3">
        <text class="block break-words text-[var(--varo-ui-text-regular)]">
          {{ metric.label }}
        </text><text :data-summary-value="metric.id" class="block break-words text-2xl font-semibold tabular-nums">
          {{ metric.value }}
        </text><text class="block break-words text-xs text-[var(--varo-ui-text-regular)]">
          {{ metric.context }}
        </text>
      </view>
    </view>
    <view class="grid gap-3">
      <view v-for="row in summaries" :key="row.id" class="min-w-0">
        <text class="block break-words font-medium">
          {{ row.title }}
        </text><text class="block break-words">
          {{ row.detail }}
        </text>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
