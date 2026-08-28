<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    modelValue?: boolean
  }>(),
  {
    disabled: false,
    loading: false,
    modelValue: false,
  },
)

const emit = defineEmits<{
  'change': [value: boolean]
  'update:modelValue': [value: boolean]
}>()

function toggle() {
  if (props.disabled || props.loading) { return }
  const value = !props.modelValue
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <button
    class="varo-switch"
    type="default"
    role="switch"
    :disabled="disabled || loading"
    :aria-checked="modelValue"
    :data-checked="String(modelValue)"
    :data-loading="String(loading)"
    @click="toggle"
  >
    <text class="varo-switch__track">
      <text class="varo-switch__thumb" />
    </text>
  </button>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
