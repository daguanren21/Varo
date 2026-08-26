<script setup lang="ts">
import { computed } from 'wevu'
import { cn, type ClassValue } from '../../lib/cn'
import type { AgentSidebarGroup, AgentSidebarItem } from './advanced-types'
import { agentChevronDownIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    activeId?: string
    className?: ClassValue
    collapsed?: boolean
    groups?: AgentSidebarGroup[]
    title?: string
  }>(),
  {
    activeId: '',
    collapsed: false,
    groups: () => [],
    title: 'AI workspace'
  }
)

const emit = defineEmits<{
  create: []
  select: [item: AgentSidebarItem]
  'update:activeId': [value: string]
  'update:collapsed': [value: boolean]
}>()

const rootClass = computed(() =>
  cn(
    'agent-sidebar overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-[width] duration-200',
    props.collapsed ? 'w-16' : 'w-60',
    props.className
  )
)

function select(item: AgentSidebarItem) {
  emit('update:activeId', item.id)
  emit('select', item)
}
</script>

<template>
  <view :class="rootClass" :data-collapsed="String(collapsed)">
    <view class="flex min-h-12 items-center justify-between gap-2 border-b border-slate-100 px-3">
      <text class="truncate text-xs font-bold text-slate-800">{{ collapsed ? 'AI' : title }}</text>
      <button class="grid h-7 w-7 flex-none place-items-center rounded-lg border border-slate-200 bg-white" type="button" aria-label="Toggle sidebar" @click="emit('update:collapsed', !collapsed)">
        <image :class="['h-3.5 w-3.5', collapsed ? '-rotate-90' : 'rotate-90']" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
      </button>
    </view>

    <button v-if="!collapsed" class="mx-2.5 mt-2.5 flex min-h-9 w-[calc(100%_-_20px)] items-center justify-center rounded-xl border border-teal-200 bg-emerald-50 text-[11px] font-bold text-teal-700" type="button" @click="emit('create')">
      + New chat
    </button>

    <view class="grid gap-3 p-2.5" role="navigation">
      <view v-for="group in groups" :key="group.id" class="grid gap-1">
        <text v-if="!collapsed" class="px-2 text-[8px] font-bold uppercase tracking-[.1em] text-slate-400">{{ group.label }}</text>
        <button
          v-for="item in group.items"
          :key="item.id"
          :class="cn('flex min-h-10 w-full items-center gap-2 rounded-xl border-0 px-2 text-left', item.id === activeId ? 'bg-emerald-50 text-teal-800' : 'bg-transparent text-slate-600')"
          type="button"
          :title="item.label"
          :data-active="String(item.id === activeId)"
          @click="select(item)"
        >
          <text class="grid h-7 w-7 flex-none place-items-center rounded-lg bg-slate-100 text-[9px] font-bold text-slate-500" aria-hidden="true">{{ item.label.charAt(0).toUpperCase() }}</text>
          <view v-if="!collapsed" class="grid min-w-0 flex-1 gap-px">
            <text class="truncate text-[11px] font-semibold">{{ item.label }}</text>
            <text v-if="item.meta" class="truncate text-[9px] text-slate-400">{{ item.meta }}</text>
          </view>
          <text v-if="!collapsed && item.badge !== undefined" class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[8px] leading-none tabular-nums text-slate-500">{{ item.badge }}</text>
        </button>
      </view>
    </view>

    <slot name="footer" />
  </view>
</template>

<style scoped>
.agent-sidebar button::after { border: 0; }
@media (prefers-reduced-motion: reduce) { .agent-sidebar { transition: none; } }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
