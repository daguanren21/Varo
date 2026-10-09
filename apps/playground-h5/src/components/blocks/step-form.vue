<script setup lang="ts">
import type { StepFormIntent, StepFormStep, StepFormValues } from './step-form-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { VInput } from '../ui/input'
import { VSwitch } from '../ui/switch'
import { canChangeStepField, canNavigateStepForm } from './step-form-actions'

const props = withDefaults(defineProps<{ steps: StepFormStep[], position: number, values: StepFormValues, errors?: Record<string, string>, error?: string, title?: string, busy?: boolean, disabled?: boolean }>(), { steps: () => [], position: -1, values: () => ({}), errors: () => ({}), error: '', title: 'Application form', busy: false, disabled: false })
const emit = defineEmits<{ intent: [intent: StepFormIntent] }>()
const current = computed(() => props.steps[props.position])
const blocked = computed(() => props.busy || props.disabled)
const last = computed(() => props.position === props.steps.length - 1)
const progress = computed(() => current.value ? `Step ${props.position + 1} of ${props.steps.length}: ${current.value.title}` : 'No form step available')
const previousDisabled = computed(() => !canNavigateStepForm(props.steps, props.position, 'previous', blocked.value))
const forwardDisabled = computed(() => !canNavigateStepForm(props.steps, props.position, last.value ? 'submit' : 'next', blocked.value))
const fields = computed(() => (current.value?.fields ?? []).map(field => ({
  ...field,
  text: typeof props.values[field.id] === 'string' ? String(props.values[field.id]) : '',
  checked: props.values[field.id] === true,
  locked: blocked.value || !!current.value?.disabled || !!field.disabled,
  errorText: props.errors[field.id] ?? '',
  placeholderText: field.kind === 'text' ? field.placeholder ?? '' : '',
  limit: field.kind === 'text' ? field.maxLength ?? -1 : -1,
  choices: field.kind === 'choice' ? field.options.map(option => ({ ...option, selected: props.values[field.id] === option.value, label: `${field.label}: ${option.label}`, locked: !canChangeStepField(field, option.value, props.values, blocked.value || !!current.value?.disabled) })) : [],
})))
function change(fieldId: string, value: string | boolean) {
  const step = current.value
  const field = step?.fields.find(item => item.id === fieldId)
  if (!step || !field || !canChangeStepField(field, value, props.values, blocked.value || !!step.disabled)) { return }
  emit('intent', { action: 'change', stepId: step.id, fieldId, value })
}
function navigate(action: 'previous' | 'next' | 'submit') {
  const step = current.value
  if (!step || !canNavigateStepForm(props.steps, props.position, action, blocked.value)) { return }
  emit('intent', { action, stepId: step.id, position: props.position, values: { ...props.values } })
}
function forward() { navigate(last.value ? 'submit' : 'next') }
</script>

<template>
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="busy">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2>
    <p class="m-0 break-words" role="status">
      {{ progress }}
    </p>
    <p v-if="current && current.description" class="m-0 break-words text-[var(--varo-ui-text-regular)]">
      {{ current.description }}
    </p>
    <form v-if="current" class="grid gap-4" @submit.prevent="forward">
      <div v-for="field in fields" :key="field.id" class="grid min-w-0 gap-2">
        <VInput v-if="field.kind === 'text'" :value="field.text" :label="field.label" :placeholder="field.placeholderText" :max-length="field.limit" :disabled="field.locked" :invalid="!!field.errorText" :error-message="field.errorText" @update:value="change(field.id, $event)" />
        <div v-else-if="field.kind === 'boolean'" class="flex items-center justify-between gap-3">
          <span class="break-words">{{ field.label }}</span><VSwitch :aria-label="field.label" :model-value="field.checked" :disabled="field.locked" @update:model-value="change(field.id, $event)" />
        </div>
        <div v-else class="grid gap-2" role="group" :aria-label="field.label">
          <span class="font-medium">{{ field.label }}</span><div class="flex flex-wrap gap-2">
            <VButton v-for="option in field.choices" :key="option.value" variant="outline" :aria-label="option.label" :aria-pressed="option.selected" :disabled="option.locked" @click="change(field.id, option.value)">
              {{ option.label }}<span v-if="option.selected"> (selected)</span>
            </VButton>
          </div>
        </div>
        <p v-if="field.description" class="m-0 break-words text-[var(--varo-ui-text-regular)]">
          {{ field.description }}
        </p>
        <p v-if="field.errorText && field.kind !== 'text'" class="m-0 text-[var(--varo-ui-danger-text)]" role="alert">
          {{ field.errorText }}
        </p>
      </div>
      <p v-if="busy" role="status">
        Validating application data…
      </p>
      <p v-if="error" class="break-words text-[var(--varo-ui-danger-text)]" role="alert">
        {{ error }}
      </p>
      <div class="flex flex-wrap gap-3">
        <VButton variant="outline" :disabled="previousDisabled" @click="navigate('previous')">
          Previous form step
        </VButton><VButton native-type="submit" :disabled="forwardDisabled">
          <span v-if="last">Submit application</span><span v-else>Next form step</span>
        </VButton>
      </div>
    </form>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-icon.css';
@import '../../styles/varo-input.css';
@import '../../styles/varo-switch.css';
</style>
