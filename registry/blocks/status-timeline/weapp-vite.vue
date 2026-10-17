<script setup lang="ts">
import type { TimelineEntry, TimelineIntent } from './status-timeline-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { canRequestTimeline } from './status-timeline-actions'

defineOptions({ properties: { entries: { type: Array, value: [] } } })
const props = withDefaults(defineProps<{ entries: TimelineEntry[], title?: string, loading?: boolean, disabled?: boolean, error?: string }>(), { entries: () => [], title: 'Status history', loading: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: TimelineIntent] }>()
const rows = computed(() => props.entries.map(entry => ({ ...entry, retryLabel: `Retry ${entry.title}`, detailLabel: `Details for ${entry.title}`, retryDisabled: !canRequestTimeline(entry, 'retry', props.loading || props.disabled), detailDisabled: !canRequestTimeline(entry, 'detail', props.loading || props.disabled) })))
function request(id: string, action: TimelineIntent['action']) {
  const entry = props.entries.find(item => item.id === id)
  if (entry && canRequestTimeline(entry, action, props.loading || props.disabled)) { emit('intent', { id, action }) }
}
</script>

<template>
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <text v-if="loading" role="status">
      Loading history…
    </text><text v-if="error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </text>
    <text v-if="!entries.length && !loading" role="status">
      No history yet
    </text>
    <view class="grid gap-4" role="list">
      <view v-for="row in rows" :key="row.id" role="listitem" class="grid min-w-0 gap-2 border-l-2 border-[var(--varo-ui-border)] pl-4" :data-status="row.status">
        <text class="block break-words font-medium">
          {{ row.title }}
        </text><text class="block break-words text-[var(--varo-ui-text-regular)]">
          {{ row.timeLabel }} · {{ row.statusLabel }}
        </text><text class="block whitespace-pre-wrap break-words">
          {{ row.detail }}
        </text>
        <text v-if="row.busy" role="status">
          Awaiting application decision
        </text>
        <view class="flex flex-wrap gap-2">
          <VButton v-if="row.canRetry" variant="outline" :aria-label="row.retryLabel" :disabled="row.retryDisabled" @click="request(row.id, 'retry')">
            Retry
          </VButton><VButton v-if="row.canDetail" variant="ghost" :aria-label="row.detailLabel" :disabled="row.detailDisabled" @click="request(row.id, 'detail')">
            View details
          </VButton>
        </view>
      </view>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
