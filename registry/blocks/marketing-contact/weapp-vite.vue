<script setup lang="ts">
import type { MarketingContactErrors, MarketingContactLabels, MarketingContactValues } from './marketing-contact.types'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VInput from '../ui/v-input.vue'
import VTextarea from '../ui/v-textarea.vue'

const props = withDefaults(defineProps<{
  values: MarketingContactValues
  canSubmit: boolean
  errors?: MarketingContactErrors
  labels?: MarketingContactLabels
  title?: string
  description?: string
  loading?: boolean
  pending?: boolean
  disabled?: boolean
  error?: string
  acknowledgement?: string
}>(), {
  values: () => ({ name: '', email: '', message: '' }),
  canSubmit: false,
  errors: () => ({}),
  labels: () => ({ name: 'Name', email: 'Email', message: 'Message', submit: 'Submit contact request', pending: 'Awaiting acknowledgement…' }),
  title: 'Talk with us',
  description: '',
  loading: false,
  pending: false,
  disabled: false,
  error: '',
  acknowledgement: '',
})
const emit = defineEmits<{
  'update:values': [values: MarketingContactValues]
  'submit': [values: MarketingContactValues]
  'cancel': []
}>()
const blocked = computed(() => props.loading || props.pending || props.disabled)
function update(field: keyof MarketingContactValues, value: string) {
  if (blocked.value || props.values[field] === value) { return }
  emit('update:values', { ...props.values, [field]: value })
}
function submit() {
  if (blocked.value || !props.canSubmit) { return }
  emit('submit', { ...props.values })
}
function cancel() {
  if (props.pending) { emit('cancel') }
}
</script>

<template>
  <view class="grid min-w-0 gap-3 break-words" :aria-label="title">
    <text class="text-xl font-semibold">
      {{ title }}
    </text>
    <text v-if="description" class="whitespace-pre-wrap text-sm">
      {{ description }}
    </text>
    <text v-if="loading" role="status">
      Loading contact form…
    </text>
    <text v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </text>
    <VInput :value="values.name" :label="labels.name" :aria-label="labels.name" :disabled="blocked" :invalid="!!errors.name" :error-message="errors.name" @update:value="update('name', $event)" />
    <VInput :value="values.email" :label="labels.email" :aria-label="labels.email" :disabled="blocked" :invalid="!!errors.email" :error-message="errors.email" @update:value="update('email', $event)" />
    <VTextarea :value="values.message" :label="labels.message" :aria-label="labels.message" :rows="5" :disabled="blocked" :invalid="!!errors.message" :error-message="errors.message" @update:value="update('message', $event)" />
    <VButton :disabled="blocked || !canSubmit" :loading="pending" :loading-text="labels.pending" @click="submit">
      {{ labels.submit }}
    </VButton>
    <VButton v-if="pending" variant="outline" @click="cancel">
      Cancel request
    </VButton>
    <text v-if="acknowledgement" role="status" class="whitespace-pre-wrap text-sm">
      {{ acknowledgement }}
    </text>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
