<script setup lang="ts">
interface RadioOption {
  desc?: string
  label: string
  value: string
}

withDefaults(defineProps<{
  options?: RadioOption[]
  value?: string
}>(), {
  options: () => [],
  value: '',
})

const emit = defineEmits<{
  click: [value: string]
}>()
</script>

<template>
  <view class="flex flex-wrap gap-3">
    <button
      v-for="option in options"
      :key="option.value"
      class="m-0 flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
      :class="option.value === value ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 bg-white text-slate-700'"
      @tap="emit('click', option.value)"
    >
      <text>{{ option.label }}</text>
      <text v-if="option.desc" class="text-xs text-slate-500">
        {{ option.desc }}
      </text>
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
