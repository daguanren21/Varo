<script setup lang="ts">
import VButton from '../ui/v-button.vue'

const props = defineProps<{
  taskId: string
  openLabel: string
  retryLabel: string
  retryable: boolean
  disabled: boolean
}>()
const emit = defineEmits<{ request: [intent: { id: string, action: 'open' | 'retry' }] }>()
const id = props.taskId
function open() {
  if (!props.disabled) { emit('request', { id, action: 'open' }) }
}
function retry() {
  if (!props.disabled && props.retryable) { emit('request', { id, action: 'retry' }) }
}
</script>

<template>
  <view class="flex flex-wrap gap-2">
    <VButton variant="outline" tone="default" :aria-label="openLabel" :disabled="disabled" @click="open">
      打开
    </VButton>
    <VButton v-if="retryable" variant="outline" :aria-label="retryLabel" :disabled="disabled" @click="retry">
      重试
    </VButton>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
