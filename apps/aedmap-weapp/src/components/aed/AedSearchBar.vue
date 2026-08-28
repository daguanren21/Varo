<script setup lang="ts">
import { shallowRef, watch } from 'wevu'

interface InputEvent {
  detail: {
    value: string
  }
}

const props = withDefaults(defineProps<{
  actionName?: string
  placeholder?: string
  showActionButton?: boolean
  value?: string
}>(), {
  actionName: '搜索',
  placeholder: '',
  showActionButton: false,
  value: '',
})

const emit = defineEmits<{
  'actionClick': [value: string]
  'confirm': [value: string]
  'update:value': [value: string]
}>()
const localValue = shallowRef(props.value)

watch(() => props.value, (value) => {
  localValue.value = value
})

function input(event: InputEvent) {
  localValue.value = event.detail.value
  emit('update:value', localValue.value)
}
</script>

<template>
  <view class="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
    <VIcon name="search" size="18" />
    <input
      class="min-w-0 flex-1 bg-transparent text-base text-slate-900"
      confirm-type="search"
      :placeholder="placeholder"
      :value="localValue"
      @confirm="emit('confirm', localValue)"
      @input="input"
    >
    <VButton v-if="showActionButton" size="sm" @click="emit('actionClick', localValue)">
      {{ actionName }}
    </VButton>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
