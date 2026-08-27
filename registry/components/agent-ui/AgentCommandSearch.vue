<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentSearchItem } from './advanced-types'
import { agentSearchIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    emptyText?: string
    items?: AgentSearchItem[]
    modelValue?: string
    placeholder?: string
  }>(),
  {
    emptyText: 'No commands found',
    items: () => [],
    modelValue: '',
    placeholder: 'Search commands…'
  }
)

const emit = defineEmits<{
  select: [item: AgentSearchItem]
  'update:modelValue': [value: string]
}>()

const rootClass = computed(() =>
  cn('agent-command-search overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl', props.className)
)
const visibleItems = computed(() => {
  const query = props.modelValue.trim().toLowerCase()
  return query
    ? props.items.filter((item) => `${item.label} ${item.description ?? ''} ${item.group ?? ''}`.toLowerCase().includes(query))
    : props.items
})

function inputValue(event: Event) {
  const miniEvent = event as Event & { detail?: { value?: string } }
  const target = event.target as HTMLInputElement | null
  emit('update:modelValue', miniEvent.detail?.value ?? target?.value ?? '')
}
</script>

<template>
  <view :class="rootClass">
    <view class="flex min-h-[50px] items-center gap-2.5 border-b border-slate-200 px-[13px]">
      <image class="h-[18px] w-[18px] flex-none" :src="agentSearchIcon" mode="aspectFit" aria-hidden="true" />
      <input class="min-w-0 flex-1 border-0 bg-transparent text-[12px] text-slate-800 outline-none" :value="modelValue" :placeholder="placeholder" @input="inputValue" />
    </view>

    <scroll-view v-if="visibleItems.length" class="max-h-[280px] p-2" scroll-y :show-scrollbar="false">
      <button v-for="item in visibleItems" :key="item.id" class="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border-0 bg-white px-2.5 py-2 text-left" hover-class="bg-slate-50" :hover-start-time="20" :hover-stay-time="70" type="button" @click="emit('select', item)">
        <view class="grid min-w-0 flex-1 gap-0.5">
          <text class="truncate text-[11px] font-semibold text-slate-700">{{ item.label }}</text>
          <text v-if="item.description" class="truncate text-[10px] text-slate-400">{{ item.description }}</text>
        </view>
        <text v-if="item.shortcut" class="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 font-mono text-[8px] text-slate-400">{{ item.shortcut }}</text>
      </button>
    </scroll-view>
    <view v-else class="grid min-h-24 place-items-center text-[11px] text-slate-400">{{ emptyText }}</view>
  </view>
</template>

<style scoped>
.agent-command-search button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
