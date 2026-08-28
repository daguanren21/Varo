<script setup lang="ts">
import { computed } from 'wevu'

interface SwipeOption {
  key?: string
  style?: Record<string, string>
  text?: string
}

const props = withDefaults(defineProps<{
  options?: SwipeOption[]
}>(), {
  options: () => [],
})

const emit = defineEmits<{
  click: [option: SwipeOption]
}>()
const actions = computed(() => props.options.map((option, index) => ({
  ...option,
  key: option.key ?? String(index),
})))
</script>

<template>
  <view class="flex items-stretch overflow-hidden">
    <view class="min-w-0 flex-1">
      <slot />
    </view>
    <button
      v-for="option in actions"
      :key="option.key"
      class="m-0 rounded-none px-4 text-sm text-white"
      :style="option.style"
      @tap="emit('click', option)"
    >
      {{ option.text }}
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
