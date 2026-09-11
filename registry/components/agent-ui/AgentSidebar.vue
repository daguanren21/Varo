<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentSidebarGroup, AgentSidebarItem } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentChatIcon, agentChevronDownIcon, agentPlusIcon } from './agent-icons'

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
  cn('agent-sidebar', props.collapsed && 'is-collapsed', props.className),
)
const toggleIconClass = computed(() => props.collapsed ? '-rotate-90' : 'rotate-90')

function itemClass(item: AgentSidebarItem) {
  return cn(
    'agent-native-button agent-native-button--block agent-sidebar__item',
    item.id === props.activeId && 'is-active',
  )
}

function select(item: AgentSidebarItem) {
  emit('update:activeId', item.id)
  emit('select', item)
}
</script>

<template>
  <view :class="rootClass" :data-collapsed="String(collapsed)">
    <view class="agent-sidebar__header">
      <view class="agent-sidebar__heading">
        <view class="agent-sidebar__brand" aria-hidden="true">
          <image class="agent-sidebar__icon" :src="agentChatIcon" mode="aspectFit" />
        </view>
        <text v-if="!collapsed" class="agent-sidebar__title">
          {{ title }}
        </text>
      </view>
      <button class="agent-native-button agent-sidebar__toggle" type="button" aria-label="Toggle sidebar" @click="emit('update:collapsed', !collapsed)">
        <image class="agent-sidebar__toggle-icon" :class="toggleIconClass" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
      </button>
    </view>

    <button v-if="!collapsed" class="agent-native-button agent-sidebar__create" type="button" @click="emit('create')">
      <image class="agent-sidebar__create-icon" :src="agentPlusIcon" mode="aspectFit" aria-hidden="true" />
      <text>New chat</text>
    </button>

    <view class="agent-sidebar__nav" role="navigation">
      <view v-for="group in groups" :key="group.id" class="agent-sidebar__group">
        <text v-if="!collapsed" class="agent-sidebar__group-label">
          {{ group.label }}
        </text>
        <button
          v-for="item in group.items"
          :key="item.id"
          :class="itemClass(item)"
          type="button"
          :title="item.label"
          :data-active="String(item.id === activeId)"
          @click="select(item)"
        >
          <view class="agent-sidebar__mark" aria-hidden="true">
            <image class="agent-sidebar__icon" :src="agentChatIcon" mode="aspectFit" />
          </view>
          <view v-if="!collapsed" class="agent-sidebar__copy">
            <text class="agent-sidebar__name">
              {{ item.label }}
            </text>
            <text v-if="item.meta" class="agent-sidebar__meta">
              {{ item.meta }}
            </text>
          </view>
          <text v-if="!collapsed && item.badge !== undefined" class="agent-sidebar__badge">
            {{ item.badge }}
          </text>
        </button>
      </view>
    </view>

    <slot name="footer" />
  </view>
</template>

<style>
.agent-sidebar {
  display: grid;
  align-content: start;
  width: 248px;
  min-height: 360px;
  overflow: hidden;
  background: var(--varo-agent-surface-strong, #f8fafc);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 18px;
}

.agent-sidebar.is-collapsed {
  width: 64px;
}

.agent-sidebar__header {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 0 12px;
  background: var(--varo-agent-surface, #fff);
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-sidebar__heading {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.agent-sidebar__brand,
.agent-sidebar__mark {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-radius: 8px;
}

.agent-sidebar__icon,
.agent-sidebar__create-icon,
.agent-sidebar__toggle-icon {
  width: 13px;
  height: 13px;
}

.agent-sidebar__title {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 760;
  color: var(--varo-agent-foreground, #172033);
  white-space: nowrap;
}

.agent-sidebar__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--varo-agent-fill, #f1f5f9);
  border: 0;
  border-radius: 9px;
}

.agent-sidebar__create {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  margin: 10px 10px 5px;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border: 1px solid var(--varo-agent-primary, #0f766e);
  border-radius: 10px;
}

.agent-sidebar__nav {
  display: grid;
  gap: 10px;
  padding: 7px;
}

.agent-sidebar__group {
  display: grid;
  gap: 3px;
}

.agent-sidebar__group-label {
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 750;
  color: var(--varo-agent-muted, #667085);
}

.agent-sidebar__item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-height: 42px;
  padding: 0 7px;
  color: var(--varo-agent-muted, #667085);
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 10px;
}

.agent-sidebar__item.is-active {
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-surface, #fff);
}

.agent-sidebar__copy {
  display: grid;
  flex: 1;
  min-width: 0;
}

.agent-sidebar__name,
.agent-sidebar__meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-sidebar__name {
  font-size: 12px;
  font-weight: 650;
}

.agent-sidebar__meta {
  font-size: 10px;
  color: var(--varo-agent-muted, #667085);
}

.agent-sidebar__badge {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 750;
  color: var(--varo-agent-text, #475569);
  background: var(--varo-agent-fill, #f1f5f9);
  border-radius: 999px;
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
