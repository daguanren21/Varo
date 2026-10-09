<script setup lang="ts">
import type { MetricsChartIntent, MetricsChartProps } from './metrics-chart-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { chartConfigurationError, chartRows } from './metrics-chart-actions'

defineOptions({ properties: { items: { type: Array, value: [] } } })
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
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading || busy">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <text class="block text-[var(--varo-ui-text-regular)]">
      Up to 12 categories. Bars compare absolute magnitude; signed values and units are always shown.
    </text>
    <text v-if="loading" role="status">
      Loading chart…
    </text><text v-if="busy" role="status">
      Chart selection pending
    </text>
    <text v-if="error" role="alert" class="block break-words text-[var(--varo-ui-danger-text)]">
      {{ error }}
    </text>
    <text v-if="configurationError" role="alert" class="block break-words text-[var(--varo-ui-danger-text)]">
      {{ configurationError }}
    </text>
    <template v-else>
      <view v-for="row in rows" :key="row.id" class="grid min-w-0 gap-2" :data-chart-id="row.id">
        <text class="block break-words font-medium">
          {{ row.valueText }}
        </text>
        <view aria-hidden="true" class="h-3 overflow-hidden rounded bg-[var(--varo-ui-bg)]">
          <view class="h-3 bg-[var(--varo-ui-primary)]" :style="row.barStyle" />
        </view>
        <view class="flex flex-wrap items-center gap-2">
          <text>{{ row.direction }}</text><VButton variant="outline" :aria-label="row.selectLabel" :aria-pressed="row.selected" :disabled="row.locked" @click="select(row.id)">
            Inspect category<text v-if="row.selected">
              (selected)
            </text>
          </VButton>
        </view>
      </view>
      <text v-if="!items.length && !loading" role="status">
        No chart data
      </text>
      <view v-if="selected" class="grid gap-1 border-t border-[var(--varo-ui-border)] pt-3" data-chart-detail="selected">
        <text class="block break-words font-semibold">
          {{ selected.label }}
        </text><text class="block break-words">
          {{ selected.value }} {{ unit }}
        </text><text v-if="selected.detail" class="block break-words">
          {{ selected.detail }}
        </text>
      </view>
    </template>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
