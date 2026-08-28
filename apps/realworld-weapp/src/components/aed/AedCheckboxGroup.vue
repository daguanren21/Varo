<script setup lang="ts">
import { computed } from 'wevu'

interface CheckboxOption {
  label?: string
  value: string
}

const props = withDefaults(defineProps<{
  options?: CheckboxOption[]
  selectedList?: string[]
}>(), {
  options: () => [],
  selectedList: () => [],
})

const emit = defineEmits<{
  change: [values: string[]]
}>()
const normalizedOptions = computed(() =>
  props.options.map(option => ({
    ...option,
    label: option.label ?? option.value,
  })),
)

function toggle(value: string, checked: boolean) {
  const values = checked
    ? Array.from(new Set([...props.selectedList, value]))
    : props.selectedList.filter(item => item !== value)
  emit('change', values)
}
</script>

<template>
  <view class="aed-checkbox-group flex flex-wrap gap-3">
    <VCheckbox
      v-for="option in normalizedOptions"
      :key="option.value"
      :checked="selectedList.includes(option.value)"
      :label="option.label"
      :value="option.value"
      @change="toggle(option.value, $event)"
    />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
