<script setup lang="ts">
import type { SettingChange, SettingEntry } from './settings-panel-actions'
import { computed } from 'vue'
import { VButton } from '../ui/button'
import { VSwitch } from '../ui/switch'
import { canChangeSetting } from './settings-panel-actions'

const props = withDefaults(defineProps<{ entries: SettingEntry[], title?: string, loading?: boolean, disabled?: boolean, error?: string }>(), { entries: () => [], title: 'Settings', loading: false, disabled: false, error: '' })
const emit = defineEmits<{ change: [intent: SettingChange] }>()
const rows = computed(() => props.entries.map(entry => ({
  ...entry,
  locked: props.loading || props.disabled || !!entry.disabled || !!entry.pending,
  checked: entry.kind === 'boolean' && entry.value,
  choices: entry.kind === 'choice' ? entry.options.map(option => ({ ...option, selected: entry.value === option.value, label: `${entry.label}: ${option.label}`, locked: !canChangeSetting(entry, option.value, props.loading || props.disabled) })) : [],
})))
function change(id: string, value: string | boolean) {
  const entry = props.entries.find(item => item.id === id)
  if (entry && canChangeSetting(entry, value, props.loading || props.disabled)) { emit('change', { id, value }) }
}
</script>

<template>
  <section class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading">
    <h2 class="m-0 break-words text-xl font-semibold">
      {{ title }}
    </h2>
    <p v-if="loading" role="status">
      Loading settings…
    </p>
    <p v-if="error" class="text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </p>
    <p v-if="!entries.length && !loading" role="status">
      No settings available
    </p>
    <div v-for="row in rows" :key="row.id" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-4">
      <div class="flex min-w-0 items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="m-0 break-words font-medium">
            {{ row.label }}
          </h3><p v-if="row.description" class="m-0 break-words text-[var(--varo-ui-text-regular)]">
            {{ row.description }}
          </p>
        </div>
        <VSwitch v-if="row.kind === 'boolean'" :model-value="row.checked" :aria-label="row.label" :disabled="row.locked" @update:model-value="change(row.id, $event)" />
      </div>
      <p v-if="row.kind === 'readonly'" class="m-0 break-words">
        {{ row.value }}
      </p>
      <div v-if="row.kind === 'choice'" class="flex flex-wrap gap-2" role="group" :aria-label="row.label">
        <VButton v-for="option in row.choices" :key="option.value" variant="outline" :aria-label="option.label" :aria-pressed="option.selected" :disabled="option.locked" @click="change(row.id, option.value)">
          {{ option.label }}<span v-if="option.selected"> (selected)</span>
        </VButton>
      </div>
      <p v-if="row.pending" class="m-0" role="status">
        Awaiting application decision
      </p>
      <p v-if="row.error" class="m-0 break-words text-[var(--varo-ui-danger-text)]" role="alert">
        {{ row.error }}
      </p>
    </div>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-switch.css';
</style>
