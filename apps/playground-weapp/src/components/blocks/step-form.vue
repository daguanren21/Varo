<script setup lang="ts">
import type { StepFormIntent, StepFormStep, StepFormValues } from './step-form-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VInput from '../ui/v-input.vue'
import VSwitch from '../ui/v-switch.vue'
import { canChangeStepField, canNavigateStepForm } from './step-form-actions'

defineOptions({
  properties: {
    steps: { type: Array, value: [] },
    values: { type: Object, value: {} },
    errors: { type: Object, value: {} },
  },
})
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
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="busy">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <text class="block break-words" role="status">
      {{ progress }}
    </text>
    <text v-if="current && current.description" class="block break-words text-[var(--varo-ui-text-regular)]">
      {{ current.description }}
    </text>
    <form v-if="current" class="grid gap-4" @submit="forward">
      <view v-for="field in fields" :key="field.id" class="grid min-w-0 gap-2">
        <VInput v-if="field.kind === 'text'" :value="field.text" :label="field.label" :placeholder="field.placeholderText" :max-length="field.limit" :disabled="field.locked" :invalid="!!field.errorText" :error-message="field.errorText" @update:value="change(field.id, $event)" />
        <view v-else-if="field.kind === 'boolean'" class="flex items-center justify-between gap-3">
          <text class="block break-words">
            {{ field.label }}
          </text><VSwitch :aria-label="field.label" :model-value="field.checked" :disabled="field.locked" @update:modelValue="change(field.id, $event)" />
        </view>
        <view v-else class="grid gap-2" role="group" :aria-label="field.label">
          <text class="font-medium">
            {{ field.label }}
          </text><view class="flex flex-wrap gap-2">
            <VButton v-for="option in field.choices" :key="option.value" variant="outline" :aria-label="option.label" :aria-pressed="option.selected" :disabled="option.locked" @click="change(field.id, option.value)">
              {{ option.label }}<text v-if="option.selected">
                (selected)
              </text>
            </VButton>
          </view>
        </view>
        <text v-if="field.description" class="block break-words text-[var(--varo-ui-text-regular)]">
          {{ field.description }}
        </text>
        <text v-if="field.errorText && field.kind !== 'text'" class="text-[var(--varo-ui-danger-text)]" role="alert">
          {{ field.errorText }}
        </text>
      </view>
      <text v-if="busy" role="status">
        Validating application data…
      </text>
      <text v-if="error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
        {{ error }}
      </text>
      <view class="flex flex-wrap gap-3">
        <VButton variant="outline" :disabled="previousDisabled" @click="navigate('previous')">
          Previous form step
        </VButton><VButton native-type="submit" :disabled="forwardDisabled">
          <text v-if="last">
            Submit application
          </text><text v-else>
            Next form step
          </text>
        </VButton>
      </view>
    </form>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
