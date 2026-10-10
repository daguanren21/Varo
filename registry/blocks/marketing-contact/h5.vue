<script setup lang="ts">
import type { MarketingContactErrors, MarketingContactLabels, MarketingContactValues } from './marketing-contact.types'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { VInput } from '../ui/input'
import { VTextarea } from '../ui/textarea'

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
  <section class="grid min-w-0 gap-3 break-words" :aria-label="title" :aria-busy="loading || pending">
    <h2 class="m-0 text-xl font-semibold">
      {{ title }}
    </h2>
    <p v-if="description" class="m-0 whitespace-pre-wrap text-sm">
      {{ description }}
    </p>
    <p v-if="loading" role="status">
      Loading contact form…
    </p>
    <p v-if="error" role="alert" class="text-[var(--varo-ui-danger)]">
      {{ error }}
    </p>
    <form class="grid gap-3" novalidate @submit.prevent="submit">
      <VInput :value="values.name" :label="labels.name" :aria-label="labels.name" autocomplete="name" :disabled="blocked" :invalid="!!errors.name" :error-message="errors.name" @update:value="update('name', $event)" />
      <VInput :value="values.email" :label="labels.email" :aria-label="labels.email" type="email" autocomplete="email" :disabled="blocked" :invalid="!!errors.email" :error-message="errors.email" @update:value="update('email', $event)" />
      <VTextarea :value="values.message" :label="labels.message" :aria-label="labels.message" :rows="5" :disabled="blocked" :invalid="!!errors.message" :error-message="errors.message" @update:value="update('message', $event)" />
      <VButton native-type="submit" :disabled="blocked || !canSubmit" :loading="pending" :loading-text="labels.pending">
        {{ labels.submit }}
      </VButton>
      <VButton v-if="pending" native-type="button" variant="outline" @click="cancel">
        Cancel request
      </VButton>
    </form>
    <p v-if="acknowledgement" role="status" class="m-0 whitespace-pre-wrap text-sm">
      {{ acknowledgement }}
    </p>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-icon.css';
@import '../../styles/varo-input.css';
</style>
