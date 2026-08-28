<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'

interface TabItem {
  title?: string
}

const props = withDefaults(defineProps<{
  className?: ClassValue
  current?: number | string
  tabList?: TabItem[]
}>(), {
  current: 0,
  tabList: () => [],
})

const emit = defineEmits<{
  click: [index: number]
}>()
const classes = computed(() => cn('flex border-b border-slate-200 bg-white', props.className))
const tabs = computed(() => props.tabList.map((item, index) => {
  const active = index === Number(props.current)
  return {
    ...item,
    active,
    buttonClass: active ? 'border-orange-500 font-semibold text-orange-600' : 'border-transparent text-slate-500',
    key: `${index}-${item.title ?? ''}`,
  }
}))
</script>

<template>
  <view :class="classes">
    <button
      v-for="(tab, index) in tabs"
      :key="tab.key"
      class="m-0 flex-1 rounded-none border-b-2 bg-transparent px-3 py-3 text-sm"
      :class="tab.buttonClass"
      @tap="emit('click', index)"
    >
      {{ tab.title }}
    </button>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
