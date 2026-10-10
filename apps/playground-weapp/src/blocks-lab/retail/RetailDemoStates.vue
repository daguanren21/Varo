<script setup lang="ts">
import VButton from '../../components/ui/v-button.vue'

const props = defineProps<{ mode: string }>()
const emit = defineEmits<{ change: [mode: string] }>()
const modes = [
  { id: 'ready', label: '正常状态' },
  { id: 'loading', label: '加载状态' },
  { id: 'empty', label: '空数据状态' },
  { id: 'error', label: '错误状态' },
  { id: 'disabled', label: '禁用状态' },
  { id: 'busy', label: '忙碌状态' },
  { id: 'long', label: '长内容状态' },
]
</script>

<template>
  <view class="grid gap-2">
    <text>本地显示状态：{{ props.mode }}</text>
    <view class="flex flex-wrap gap-2">
      <VButton v-for="item in modes" :key="item.id" variant="outline" :disabled="item.id === mode" @click="emit('change', item.id)">
        {{ item.label }}
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
