<script setup lang="ts">
import type { MarketingProcessStep } from './marketing-process.types'
import { computed } from 'vue'
import { VButton } from '../ui/button'

const props = withDefaults(defineProps<{
  steps: MarketingProcessStep[]
  title?: string
  loading?: boolean
  error?: string
  disabled?: boolean
  pendingId?: string
}>(), { title: 'How it works', loading: false, error: '', disabled: false, pendingId: '' })
const emit = defineEmits<{ action: [step: MarketingProcessStep] }>()
const blocked = computed(() => props.loading || !!props.error || props.disabled || !!props.pendingId)
const stateLabels = { upcoming: 'Upcoming', active: 'Current step', completed: 'Completed' }
const rows = computed(() => props.steps.map((step, index) => ({
  ...step,
  number: index + 1,
  stateLabel: stateLabels[step.state],
  current: step.state === 'active' ? 'step' as const : undefined,
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
  <section class="grid min-w-0 gap-4 break-words" :aria-label="title" :aria-busy="loading">
    <h2 class="m-0 text-xl font-semibold">
      {{ title }}
    </h2>
    <p v-if="loading" role="status">
      Loading process…
    </p>
    <p v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </p>
    <p v-if="!steps.length && !loading && !error" role="status">
      No process steps available.
    </p>
    <ol class="m-0 grid list-none gap-4 p-0">
      <li v-for="step in rows" :key="step.id" class="grid min-w-0 gap-2 border-l-2 border-[var(--varo-ui-border)] pl-4" :data-process-step="step.id" :data-state="step.state" :aria-current="step.current">
        <p class="m-0 text-xs text-[var(--varo-ui-text-regular)]">
          {{ step.number }} · {{ step.stateLabel }}
        </p>
        <h3 class="m-0 text-lg font-semibold">
          {{ step.title }}
        </h3>
        <p class="m-0 whitespace-pre-wrap text-sm leading-relaxed">
          {{ step.description }}
        </p>
        <VButton v-if="step.action" class="h-auto min-h-11 max-w-full whitespace-normal break-words" variant="outline" :disabled="step.blocked" :loading="step.pending" loading-text="Awaiting host…" @click="activate(step.id)">
          {{ step.action.label }}
        </VButton>
      </li>
    </ol>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
