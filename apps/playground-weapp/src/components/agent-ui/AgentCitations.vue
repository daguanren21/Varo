<script setup lang="ts">
import { computed, shallowRef } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentCitationItem } from './advanced-types'
import { agentChevronDownIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    defaultOpen?: boolean
    items?: AgentCitationItem[]
    title?: string
  }>(),
  {
    defaultOpen: false,
    items: () => [],
    title: 'Sources'
  }
)

const emit = defineEmits<{
  open: [item: AgentCitationItem]
  'update:open': [value: boolean]
}>()

const open = shallowRef(props.defaultOpen)
const rootClass = computed(() =>
  cn('agent-citations overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', props.className)
)

function toggle() {
  open.value = !open.value
  emit('update:open', open.value)
}
</script>

<template>
  <view :class="rootClass" :data-open="String(open)">
    <button class="flex min-h-12 w-full items-center justify-between gap-3 border-0 bg-white px-[13px] text-left" type="button" :aria-expanded="open" @click="toggle">
      <view class="flex min-w-0 items-center gap-2">
        <text class="truncate text-xs font-bold text-slate-800">{{ title }}</text>
        <text class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-100 px-1 text-[8px] leading-none tabular-nums text-slate-500">{{ items.length }}</text>
      </view>
      <image :class="['h-4 w-4 transition-transform', open && 'rotate-180']" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
    </button>

    <view v-if="open" class="grid gap-1 border-t border-slate-100 p-2">
      <button v-for="(item, index) in items" :key="item.id" class="flex min-h-11 w-full items-center gap-2.5 rounded-xl border-0 bg-slate-50 px-2.5 py-2 text-left" hover-class="bg-slate-100" :hover-start-time="20" :hover-stay-time="70" type="button" @click="emit('open', item)">
        <text class="grid h-6 w-6 flex-none place-items-center rounded-lg bg-white text-[9px] font-bold tabular-nums text-teal-700 shadow-sm">{{ index + 1 }}</text>
        <view class="grid min-w-0 flex-1 gap-0.5">
          <text class="truncate text-[11px] font-semibold text-slate-700">{{ item.title }}</text>
          <text class="truncate text-[10px] text-slate-400">{{ item.domain || item.description || item.url }}</text>
        </view>
      </button>
    </view>
  </view>
</template>

<style scoped>
.agent-citations button::after { border: 0; }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
