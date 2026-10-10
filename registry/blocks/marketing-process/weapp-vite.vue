<script setup lang="ts">
import type { MarketingProcessStep } from './marketing-process.types'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'

defineOptions({
  properties: {
    steps: { type: Array, value: [] },
  },
})

const props = withDefaults(defineProps<{
  steps: MarketingProcessStep[]
  title?: string
  loading?: boolean
  error?: string
  disabled?: boolean
  pendingId?: string
}>(), { steps: () => [], title: 'How it works', loading: false, error: '', disabled: false, pendingId: '' })
const emit = defineEmits<{ action: [step: MarketingProcessStep] }>()
const blocked = computed(() => props.loading || !!props.error || props.disabled || !!props.pendingId)
const stateLabels = { upcoming: 'Upcoming', active: 'Current step', completed: 'Completed' }
const rows = computed(() => props.steps.map((step, index) => ({
  ...step,
  number: index + 1,
  stateLabel: stateLabels[step.state],
  blocked: blocked.value || !step.action?.allowed || !!step.action?.disabled,
  pending: step.id === props.pendingId,
})))
function activate(id: string) {
  const step = props.steps.find(item => item.id === id)
  if (blocked.value || !step?.action?.allowed || step.action.disabled) { return }
  emit('action', step)
}
</script>

<template>
  <view class="grid min-w-0 gap-4 break-words" :aria-label="title">
    <text class="text-xl font-semibold">
      {{ title }}
    </text>
    <text v-if="loading" role="status">
      Loading process…
    </text>
    <text v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </text>
    <text v-if="!steps.length && !loading && !error" role="status">
      No process steps available.
    </text>
    <view v-for="step in rows" :key="step.id" class="grid min-w-0 gap-2 border-l-2 border-[var(--varo-ui-border)] pl-4" :data-process-step="step.id" :data-state="step.state">
      <text class="text-xs text-[var(--varo-ui-text-regular)]">
        {{ step.number }} · {{ step.stateLabel }}
      </text>
      <text class="text-lg font-semibold">
        {{ step.title }}
      </text>
      <text class="whitespace-pre-wrap text-sm leading-relaxed">
        {{ step.description }}
      </text>
      <VButton v-if="step.action" class-name="h-auto min-h-11 max-w-full whitespace-normal break-words" variant="outline" :disabled="step.blocked" :loading="step.pending" loading-text="Awaiting host…" @click="activate(step.id)">
        {{ step.action.label }}
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
