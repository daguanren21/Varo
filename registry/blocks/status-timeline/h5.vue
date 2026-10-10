<script setup lang="ts">
import type { TimelineEntry, TimelineIntent } from './status-timeline-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { canRequestTimeline } from './status-timeline-actions'

const props = withDefaults(defineProps<{ entries: TimelineEntry[], title?: string, loading?: boolean, disabled?: boolean, error?: string }>(), { entries: () => [], title: 'Status history', loading: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: TimelineIntent] }>()
const rows = computed(() => props.entries.map(entry => ({ ...entry, retryLabel: `Retry ${entry.title}`, detailLabel: `Details for ${entry.title}`, retryDisabled: !canRequestTimeline(entry, 'retry', props.loading || props.disabled), detailDisabled: !canRequestTimeline(entry, 'detail', props.loading || props.disabled) })))
function request(id: string, action: TimelineIntent['action']) {
  const entry = props.entries.find(item => item.id === id)
  if (entry && canRequestTimeline(entry, action, props.loading || props.disabled)) { emit('intent', { id, action }) }
}
</script>

<template>
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2>
    <p v-if="loading" role="status">
      Loading history…
    </p><p v-if="error" class="break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </p>
    <p v-if="!entries.length && !loading" role="status">
      No history yet
    </p>
    <ol class="m-0 grid list-none gap-4 p-0">
      <li v-for="row in rows" :key="row.id" class="grid min-w-0 gap-2 border-l-2 border-[var(--varo-ui-border)] pl-4" :data-status="row.status">
        <h3 class="m-0 break-words font-medium">
          {{ row.title }}
        </h3><p class="m-0 break-words text-[var(--varo-ui-text-regular)]">
          {{ row.timeLabel }} · {{ row.statusLabel }}
        </p><p class="m-0 whitespace-pre-wrap break-words">
          {{ row.detail }}
        </p>
        <p v-if="row.busy" role="status">
          Awaiting application decision
        </p>
        <div class="flex flex-wrap gap-2">
          <VButton v-if="row.canRetry" variant="outline" :aria-label="row.retryLabel" :disabled="row.retryDisabled" @click="request(row.id, 'retry')">
            Retry
          </VButton><VButton v-if="row.canDetail" variant="ghost" :aria-label="row.detailLabel" :disabled="row.detailDisabled" @click="request(row.id, 'detail')">
            View details
          </VButton>
        </div>
      </li>
    </ol>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
