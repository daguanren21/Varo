<script setup lang="ts">
import type { OnboardingIntent, OnboardingStep } from './onboarding-flow-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import { canNavigateOnboarding } from './onboarding-flow-actions'

defineOptions({ properties: { steps: { type: Array, value: [] } } })
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
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="busy">
    <view class="flex items-start justify-between gap-3">
      <text class="block break-words text-xl font-semibold">
        {{ title }}
      </text><VButton variant="ghost" @click="request('close')">
        Close onboarding
      </VButton>
    </view>
    <text class="block text-[var(--varo-ui-text-regular)]" role="status">
      {{ progress }}
    </text>
    <view v-if="current" class="grid min-w-0 gap-2">
      <text class="block break-words text-lg font-medium">
        {{ current.title }}
      </text><text class="block whitespace-pre-wrap break-words">
        {{ current.description }}
      </text>
    </view>
    <text v-if="busy" role="status">
      Awaiting application decision
    </text>
    <text v-if="error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </text>
    <view v-if="current" class="flex flex-wrap gap-3">
      <VButton variant="outline" :disabled="backDisabled" @click="request('back')">
        Back
      </VButton><VButton :disabled="forwardDisabled" @click="forward">
        <text v-if="last">
          Finish onboarding
        </text><text v-else>
          Next onboarding step
        </text>
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
