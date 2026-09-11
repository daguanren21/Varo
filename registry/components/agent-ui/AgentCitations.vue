<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentCitationItem } from './advanced-types'
import { computed, shallowRef } from 'wevu'
import { cn } from '../../lib/cn'
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
    title: 'Sources',
  },
)

const emit = defineEmits<{
  'open': [item: AgentCitationItem]
  'update:open': [value: boolean]
}>()

const open = shallowRef(props.defaultOpen)
const openAttr = computed(() => String(open.value))
const hint = computed(() => open.value ? '点击来源打开原文' : '展开查看引用来源')
const rootClass = computed(() => cn('agent-citations', props.className))
const displayItems = computed(() =>
  props.items.map(item => ({
    ...item,
    mark: (item.domain || item.title).trim().charAt(0).toUpperCase() || '#',
    meta: item.domain || item.url || '',
  })),
)

function toggle() {
  open.value = !open.value
  emit('update:open', open.value)
}

function openItem(id: string) {
  const item = props.items.find(entry => entry.id === id)
  if (item) {
    emit('open', item)
  }
}
</script>

<template>
  <view :class="rootClass" :data-open="openAttr">
    <button class="agent-native-button agent-native-button--block agent-citations__trigger" type="button" :aria-expanded="open" @click="toggle">
      <view class="agent-citations__heading">
        <text class="agent-citations__title">
          {{ title }}
        </text>
        <text class="agent-citations__hint">
          {{ hint }}
        </text>
      </view>
      <view class="agent-citations__count-wrap">
        <text class="agent-citations__count">
          {{ items.length }}
        </text>
        <image class="agent-citations__chevron" :class="[open && 'is-open']" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
      </view>
    </button>

    <view v-if="open" class="agent-citations__list">
      <button
        v-for="item in displayItems"
        :key="item.id"
        class="agent-native-button agent-native-button--block agent-citations__item"
        type="button"
        @click="openItem(item.id)"
      >
        <text class="agent-citations__mark" aria-hidden="true">
          {{ item.mark }}
        </text>
        <view class="agent-citations__copy">
          <text class="agent-citations__name">
            {{ item.title }}
          </text>
          <text v-if="item.meta" class="agent-citations__meta">
            {{ item.meta }}
          </text>
          <text v-if="item.description" class="agent-citations__description">
            {{ item.description }}
          </text>
        </view>
      </button>
    </view>
  </view>
</template>

<style>
.agent-citations {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-citations__trigger {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  min-height: 52px;
  padding: 12px 14px 11px;
  text-align: left;
  background: var(--varo-agent-surface, #fff);
  border: 0;
}

.agent-citations__heading {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agent-citations__title {
  font-size: 13px;
  font-weight: 760;
  line-height: 18px;
  color: var(--varo-agent-foreground, #172033);
}

.agent-citations__hint,
.agent-citations__meta,
.agent-citations__description {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-citations__count-wrap {
  display: flex;
  flex: none;
  gap: 6px;
  align-items: center;
}

.agent-citations__count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-fill, #f1f5f9);
  border-radius: 999px;
}

.agent-citations__chevron {
  width: 16px;
  height: 16px;
}

.agent-citations__chevron.is-open {
  transform: rotate(180deg);
}

.agent-citations__list {
  display: grid;
  gap: 8px;
  padding: 0 12px 12px;
}

.agent-citations__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  min-height: 58px;
  padding: 9px 10px;
  text-align: left;
  background: var(--varo-agent-surface-strong, #f8fafc);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 12px;
}

.agent-citations__mark {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 12px;
  font-weight: 800;
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-radius: 9px;
}

.agent-citations__copy {
  display: grid;
  flex: 1;
  gap: 3px;
  min-width: 0;
}

.agent-citations__name,
.agent-citations__meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-citations__name {
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  color: var(--varo-agent-foreground, #172033);
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
