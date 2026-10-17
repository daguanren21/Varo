<script setup lang="ts">
import type { SummaryIntent, SummaryMetric, SummaryPeriod, SummaryRow } from './summary-dashboard-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { canSelectSummaryPeriod } from './summary-dashboard-actions'

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
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Summary period">
      <VButton v-for="choice in choices" :key="choice.id" variant="outline" :aria-label="choice.label" :aria-pressed="choice.selected" :disabled="choice.locked" @click="request({ action: 'period', id: choice.id })">
        {{ choice.label }}<span v-if="choice.selected"> (selected)</span>
      </VButton>
    </div>
    <p v-if="loading" role="status">
      Loading summary…
    </p>
    <div v-if="error">
      <p class="break-words text-[var(--varo-ui-danger-text)]" role="alert">
        {{ error }}
      </p><VButton v-if="canRetry" variant="outline" :disabled="loading || disabled" @click="request({ action: 'retry' })">
        Retry summary
      </VButton>
    </div>
    <p v-if="!metrics.length && !summaries.length && !loading" role="status">
      No summary data
    </p>
    <dl class="m-0 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div v-for="metric in metrics" :key="metric.id" class="min-w-0 border-b border-[var(--varo-ui-border-lighter)] pb-3">
        <dt class="break-words text-[var(--varo-ui-text-regular)]">
          {{ metric.label }}
        </dt><dd :data-summary-value="metric.id" class="m-0 break-words text-2xl font-semibold tabular-nums">
          {{ metric.value }}
        </dd><dd class="m-0 break-words text-xs text-[var(--varo-ui-text-regular)]">
          {{ metric.context }}
        </dd>
      </div>
    </dl>
    <ul class="m-0 grid list-none gap-3 p-0">
      <li v-for="row in summaries" :key="row.id" class="min-w-0">
        <h3 class="m-0 break-words font-medium">
          {{ row.title }}
        </h3><p class="m-0 break-words">
          {{ row.detail }}
        </p>
      </li>
    </ul>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
