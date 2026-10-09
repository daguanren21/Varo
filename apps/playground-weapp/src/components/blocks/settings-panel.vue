<script setup lang="ts">
import type { SettingChange, SettingEntry } from './settings-panel-actions'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import VSwitch from '../ui/v-switch.vue'
import { canChangeSetting } from './settings-panel-actions'

defineOptions({ properties: { entries: { type: Array, value: [] } } })

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
  <view class="grid min-w-0 gap-4 bg-[var(--varo-ui-surface)] p-4 text-sm leading-6 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="loading">
    <text class="block break-words text-xl font-semibold">
      {{ title }}
    </text>
    <text v-if="loading" role="status">
      Loading settings…
    </text>
    <text v-if="error" class="text-[var(--varo-ui-danger-text)]" role="alert">
      {{ error }}
    </text>
    <text v-if="!entries.length && !loading" role="status">
      No settings available
    </text>
    <view v-for="row in rows" :key="row.id" class="grid min-w-0 gap-2 border-b border-[var(--varo-ui-border-lighter)] pb-4">
      <view class="flex min-w-0 items-start justify-between gap-3">
        <view class="min-w-0">
          <text class="block break-words font-medium">
            {{ row.label }}
          </text><text v-if="row.description" class="block break-words text-[var(--varo-ui-text-regular)]">
            {{ row.description }}
          </text>
        </view>
        <VSwitch v-if="row.kind === 'boolean'" :model-value="row.checked" :aria-label="row.label" :disabled="row.locked" @update:modelValue="change(row.id, $event)" />
      </view>
      <text v-if="row.kind === 'readonly'" class="block break-words">
        {{ row.value }}
      </text>
      <view v-if="row.kind === 'choice'" class="flex flex-wrap gap-2" role="group" :aria-label="row.label">
        <VButton v-for="option in row.choices" :key="option.value" variant="outline" :aria-label="option.label" :aria-pressed="option.selected" :disabled="option.locked" @click="change(row.id, option.value)">
          {{ option.label }}<text v-if="option.selected">
            (selected)
          </text>
        </VButton>
      </view>
      <text v-if="row.pending" role="status">
        Awaiting application decision
      </text>
      <text v-if="row.error" class="block break-words text-[var(--varo-ui-danger-text)]" role="alert">
        {{ row.error }}
      </text>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
