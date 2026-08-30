<script setup lang="ts">
import type { CheckboxGroupContext, CheckboxValue } from './selection-context'
import { useCheckboxRoot } from '@varo-ui/headless'
import { computed, inject } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
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
const controlled = computed(() => true)
const checkbox = useCheckboxRoot({
  runtime: varoReactiveRuntime,
  checked: selected,
  checkedControlled: controlled,
  disabled: inactive,
  onCheckedChange: update,
})
const checked = computed(() => checkbox.state.checked.value)
const checkboxDisabled = computed(() => checkbox.state.disabled.value)
const interactive = computed(() => checkbox.state.interactive.value)
const checkmark = computed(() => checkbox.state.checked.value ? '✓' : '')

function update(checked: boolean) {
  if (group) {
    group.toggle(props.value)
    return
  }
  emit('update:checked', checked)
  emit('change', checked)
}

function toggle() {
  checkbox.events.toggle()
}
</script>

<template>
  <button
    class="varo-checkbox"
    type="button"
    role="checkbox"
    :disabled="!interactive"
    :aria-checked="checked"
    :aria-disabled="checkboxDisabled"
    :data-checked="String(checked)"
    :data-disabled="String(checkboxDisabled)"
    @click="toggle"
  >
    <text class="varo-checkbox__icon" aria-hidden="true">
      {{ checkmark }}
    </text>
    <text class="varo-checkbox__label">
      <slot>{{ props.label }}</slot>
    </text>
  </button>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
