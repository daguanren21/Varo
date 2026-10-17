<script setup lang="ts">
import type { OnboardingIntent, OnboardingStep } from './onboarding-flow-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { canNavigateOnboarding } from './onboarding-flow-actions'

const props = withDefaults(defineProps<{ steps: OnboardingStep[], position: number, title?: string, busy?: boolean, disabled?: boolean, error?: string }>(), { steps: () => [], position: -1, title: 'Getting started', busy: false, disabled: false, error: '' })
const emit = defineEmits<{ intent: [intent: OnboardingIntent] }>()
const current = computed(() => props.steps[props.position])
const progress = computed(() => current.value ? `Step ${props.position + 1} of ${props.steps.length}` : 'No onboarding step available')
const last = computed(() => props.position === props.steps.length - 1)
const backDisabled = computed(() => !canNavigateOnboarding(props.steps, props.position, 'back', props.busy || props.disabled))
const forwardDisabled = computed(() => !canNavigateOnboarding(props.steps, props.position, last.value ? 'finish' : 'next', props.busy || props.disabled))
function request(action: OnboardingIntent['action']) {
  if (!canNavigateOnboarding(props.steps, props.position, action, props.busy || props.disabled)) { return }
  emit('intent', { action, position: props.position, stepId: current.value?.id ?? '' })
}
function forward() { request(last.value ? 'finish' : 'next') }
</script>

<template>
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="busy">
    <div class="flex items-start justify-between gap-3">
      <h2 class="m-0 break-words text-xl font-semibold">
        {{ title }}
      </h2><VButton variant="ghost" @click="request('close')">
        Close onboarding
      </VButton>
    </div>
    <p class="m-0 text-[var(--varo-ui-text-regular)]" role="status">
      {{ progress }}
    </p>
    <div v-if="current" class="grid min-w-0 gap-2">
      <h3 class="m-0 break-words text-lg font-medium">
        {{ current.title }}
      </h3><p class="m-0 whitespace-pre-wrap break-words">
        {{ current.description }}
      </p>
    </div>
    <p v-if="busy" role="status">
      Awaiting application decision
    </p>
    <p v-if="error" class="break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </p>
    <div v-if="current" class="flex flex-wrap gap-3">
      <VButton variant="outline" :disabled="backDisabled" @click="request('back')">
        Back
      </VButton><VButton :disabled="forwardDisabled" @click="forward">
        <span v-if="last">Finish onboarding</span><span v-else>Next onboarding step</span>
      </VButton>
    </div>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
</style>
