<script setup lang="ts">
import { computed } from 'wevu'

const props = withDefaults(defineProps<{
  noMoreText?: string
  status?: 'loading' | 'more' | 'noMore' | string
}>(), {
  noMoreText: '没有更多了',
  status: 'more',
})

const label = computed(() => {
  if (props.status === 'loading') { return '加载中...' }
  if (props.status === 'noMore') { return props.noMoreText }
  return '加载更多'
})
</script>

<template>
  <view class="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
    <VLoading v-if="status === 'loading'" size="sm" />
    <text>{{ label }}</text>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
