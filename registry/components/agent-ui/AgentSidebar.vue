<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentSidebarGroup, AgentSidebarItem } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
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
    title: 'AI workspace',
  },
)

const emit = defineEmits<{
  'create': []
  'select': [item: AgentSidebarItem]
  'update:activeId': [value: string]
  'update:collapsed': [value: boolean]
}>()

const rootClass = computed(() =>
  cn(
    'agent-sidebar overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] shadow-sm transition-[width] duration-200',
    props.collapsed ? 'w-16' : 'w-60',
    props.className,
  ),
)

function select(item: AgentSidebarItem) {
  emit('update:activeId', item.id)
  emit('select', item)
}
</script>

<template>
  <view :class="rootClass" :data-collapsed="String(collapsed)">
    <view class="flex min-h-12 items-center justify-between gap-2 border-b border-[var(--varo-agent-border)] px-3">
      <text class="truncate text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ collapsed ? 'AI' : title }}
      </text>
      <button class="grid h-7 w-7 flex-none place-items-center rounded-lg border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]" type="button" aria-label="Toggle sidebar" @click="emit('update:collapsed', !collapsed)">
        <image class="h-3.5 w-3.5" :class="[collapsed ? '-rotate-90' : 'rotate-90']" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
      </button>
    </view>

    <button v-if="!collapsed" class="mx-2.5 mt-2.5 flex min-h-9 w-[calc(100%_-_20px)] items-center justify-center rounded-xl border border-[var(--varo-agent-border-strong)] bg-[var(--varo-agent-success-soft)] text-[12px] font-bold text-[var(--varo-agent-primary)]" type="button" @click="emit('create')">
      + New chat
    </button>

    <view class="grid gap-3 p-2.5" role="navigation">
      <view v-for="group in groups" :key="group.id" class="grid gap-1">
        <text v-if="!collapsed" class="px-2 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--varo-agent-muted)]">
          {{ group.label }}
        </text>
        <button
          v-for="item in group.items"
          :key="item.id"
          :class="cn('flex min-h-10 w-full items-center gap-2 rounded-xl border-0 px-2 text-left', item.id === activeId ? 'bg-[var(--varo-agent-success-soft)] text-[var(--varo-agent-primary)]' : 'bg-transparent text-[var(--varo-agent-text)]')"
          type="button"
          :title="item.label"
          :data-active="String(item.id === activeId)"
          @click="select(item)"
        >
          <text class="grid h-7 w-7 flex-none place-items-center rounded-lg bg-[var(--varo-agent-fill)] text-[10px] font-bold text-[var(--varo-agent-text)]" aria-hidden="true">
            {{ item.label.charAt(0).toUpperCase() }}
          </text>
          <view v-if="!collapsed" class="grid min-w-0 flex-1 gap-px">
            <text class="truncate text-[12px] font-semibold">
              {{ item.label }}
            </text>
            <text v-if="item.meta" class="truncate text-[10px] text-[var(--varo-agent-muted)]">
              {{ item.meta }}
            </text>
          </view>
          <text v-if="!collapsed && item.badge !== undefined" class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--varo-agent-surface)] px-1 text-[10px] leading-none tabular-nums text-[var(--varo-agent-text)]">
            {{ item.badge }}
          </text>
        </button>
      </view>
    </view>

    <slot name="footer" />
  </view>
</template>

<style scoped>
.agent-sidebar button::after {
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .agent-sidebar {
    transition: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
