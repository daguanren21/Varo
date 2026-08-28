<script setup lang="ts">
import type { CheckboxGroupContext, CheckboxValue } from './selection-context'
import { computed, inject } from 'wevu'
import { checkboxGroupKey } from './selection-context'

const props = withDefaults(
  defineProps<{
    checked?: boolean
    disabled?: boolean
    label?: string
    value?: CheckboxValue
  }>(),
  {
    checked: false,
    disabled: false,
    label: '',
    value: true,
  },
)

const emit = defineEmits<{
  'change': [value: boolean]
  'update:checked': [value: boolean]
}>()

const group = inject<CheckboxGroupContext>(checkboxGroupKey)
const selected = computed(() => group?.isChecked(props.value) ?? props.checked)
const inactive = computed(() => props.disabled || Boolean(group?.disabled()))

function toggle() {
  if (inactive.value) { return }
  if (group) {
    group.toggle(props.value)
    return
  }
  const checked = !selected.value
  emit('update:checked', checked)
  emit('change', checked)
}
</script>

<template>
  <button
    class="varo-checkbox"
    type="default"
    role="checkbox"
    :disabled="inactive"
    :aria-checked="selected"
    :aria-disabled="inactive"
    :data-checked="String(selected)"
    :data-disabled="String(inactive)"
    @click="toggle"
  >
    <text class="varo-checkbox__icon" aria-hidden="true">
      {{ selected ? '✓' : '' }}
    </text>
    <text class="varo-checkbox__label">
      <slot>{{ label }}</slot>
    </text>
  </button>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
