<script setup lang="ts">
import type { MetricsChartIntent, MetricsChartProps } from './metrics-chart-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { chartConfigurationError, chartRows } from './metrics-chart-actions'

const props = withDefaults(defineProps<MetricsChartProps>(), { items: () => [], unit: '', selectedId: '', title: 'Metrics comparison', loading: false, busy: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: MetricsChartIntent] }>()
const configurationError = computed(() => chartConfigurationError(props.items, props.unit))
const blocked = computed(() => props.loading || props.busy || props.disabled || !!configurationError.value)
const rows = computed(() => configurationError.value ? [] : chartRows(props.items, props.unit, props.selectedId, blocked.value))
const selected = computed(() => props.items.find(item => item.id === props.selectedId))
function select(id: string) {
  if (blocked.value || id === props.selectedId || !props.items.some(item => item.id === id && !item.disabled)) { return }
  emit('intent', { action: 'select', id })
}
</script>

<template>
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2>
    <p class="m-0 text-[var(--varo-ui-text-regular)]">
      Up to 12 categories. Bars compare absolute magnitude; signed values and units are always shown.
    </p>
    <p v-if="loading" role="status">
      Loading chart…
    </p><p v-if="busy" role="status">
      Chart selection pending
    </p>
    <p v-if="error" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </p>
    <p v-if="configurationError" role="alert" class="break-words text-[var(--varo-ui-danger-text)]">
      {{ configurationError }}
    </p>
    <template v-else>
      <div v-for="row in rows" :key="row.id" class="grid min-w-0 gap-2" :data-chart-id="row.id">
        <p class="m-0 break-words font-medium">
          {{ row.valueText }}
        </p>
        <div aria-hidden="true" class="h-3 overflow-hidden rounded bg-[var(--varo-ui-bg)]">
          <div class="h-3 bg-[var(--varo-ui-primary)]" :style="row.barStyle" />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span>{{ row.direction }}</span><VButton variant="outline" :aria-label="row.selectLabel" :aria-pressed="row.selected" :disabled="row.locked" @click="select(row.id)">
            Inspect category<span v-if="row.selected"> (selected)</span>
          </VButton>
        </div>
      </div>
      <p v-if="!items.length && !loading" role="status">
        No chart data
      </p>
      <div v-if="selected" class="grid gap-1 border-t border-[var(--varo-ui-border)] pt-3" data-chart-detail="selected">
        <h3 class="m-0 break-words">
          {{ selected.label }}
        </h3><p class="m-0 break-words">
          {{ selected.value }} {{ unit }}
        </p><p v-if="selected.detail" class="m-0 break-words">
          {{ selected.detail }}
        </p>
      </div>
    </template>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
