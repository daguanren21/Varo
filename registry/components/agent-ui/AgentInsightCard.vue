<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentInsightItem } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentChevronDownIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    current?: number
    insights?: AgentInsightItem[]
    title?: string
  }>(),
  {
    current: 0,
    insights: () => [],
    title: 'Insights',
  },
)

const emit = defineEmits<{
  'action': [item: AgentInsightItem]
  'update:current': [value: number]
}>()

const active = computed(() =>
  props.insights[Math.min(Math.max(0, props.current), Math.max(0, props.insights.length - 1))],
)
const activeTone = computed(() => active.value?.tone || 'default')
const countLabel = computed(() => `${props.insights.length ? props.current + 1 : 0}/${props.insights.length}`)
const rootClass = computed(() =>
  cn('agent-insight-card', `is-${activeTone.value}`, props.className),
)

function move(delta: number) {
  if (!props.insights.length) { return }
  emit('update:current', (props.current + delta + props.insights.length) % props.insights.length)
}

function emitAction() {
  if (active.value) {
    emit('action', active.value)
  }
}
</script>

<template>
  <view :class="rootClass" :data-tone="activeTone">
    <view class="agent-insight-card__header">
      <view class="agent-insight-card__heading">
        <text class="agent-insight-card__title">
          {{ title }}
        </text>
        <text class="agent-insight-card__label">
          {{ active?.label || '运行指标' }}
        </text>
      </view>
      <text class="agent-insight-card__count">
        {{ countLabel }}
      </text>
    </view>

    <view v-if="active" class="agent-insight-card__body">
      <text v-if="active.value" class="agent-insight-card__value">
        {{ active.value }}
      </text>
      <text class="agent-insight-card__copy">
        {{ active.description }}
      </text>
    </view>
    <view v-else class="agent-insight-card__empty">
      暂无洞察
    </view>

    <view class="agent-insight-card__footer">
      <view class="agent-insight-card__nav">
        <button class="agent-native-button agent-insight-card__nav-btn" type="button" aria-label="Previous insight" @click="move(-1)">
          <image class="agent-insight-card__nav-icon is-prev" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
        </button>
        <button class="agent-native-button agent-insight-card__nav-btn" type="button" aria-label="Next insight" @click="move(1)">
          <image class="agent-insight-card__nav-icon is-next" :src="agentChevronDownIcon" mode="aspectFit" aria-hidden="true" />
        </button>
      </view>
      <button v-if="active?.action" class="agent-native-button agent-insight-card__action" type="button" @click="emitAction">
        {{ active.action }}
      </button>
    </view>
  </view>
</template>

<style>
.agent-insight-card {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-insight-card.is-success {
  border-color: var(--varo-agent-success, #16a34a);
}

.agent-insight-card.is-warning {
  border-color: var(--varo-agent-warning, #d97706);
}

.agent-insight-card.is-danger {
  border-color: var(--varo-agent-danger, #dc2626);
}

.agent-insight-card__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 52px;
  padding: 12px 14px 11px;
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-insight-card__heading {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agent-insight-card__title {
  font-size: 13px;
  font-weight: 760;
  line-height: 18px;
  color: var(--varo-agent-foreground, #172033);
}

.agent-insight-card__label,
.agent-insight-card__count {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-insight-card__count {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.agent-insight-card__body {
  display: grid;
  gap: 8px;
  min-height: 132px;
  padding: 18px 16px 16px;
}

.agent-insight-card.is-success .agent-insight-card__body {
  background: var(--varo-agent-success-soft, #dcfce7);
}

.agent-insight-card.is-warning .agent-insight-card__body {
  background: var(--varo-agent-warning-soft, #fffbeb);
}

.agent-insight-card.is-danger .agent-insight-card__body {
  background: var(--varo-agent-danger-soft, #fee2e2);
}

.agent-insight-card__value {
  font-size: 32px;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--varo-agent-primary, #0f766e);
}

.agent-insight-card.is-success .agent-insight-card__value {
  color: var(--varo-agent-success, #16a34a);
}

.agent-insight-card.is-warning .agent-insight-card__value {
  color: var(--varo-agent-warning, #d97706);
}

.agent-insight-card.is-danger .agent-insight-card__value {
  color: var(--varo-agent-danger, #dc2626);
}

.agent-insight-card__copy,
.agent-insight-card__empty {
  font-size: 13px;
  line-height: 1.5;
  color: var(--varo-agent-foreground, #172033);
}

.agent-insight-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 132px;
  color: var(--varo-agent-muted, #667085);
}

.agent-insight-card__footer {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 12px;
  border-top: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-insight-card__nav {
  display: flex;
  gap: 6px;
}

.agent-insight-card__nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 9px;
}

.agent-insight-card__nav-icon {
  width: 14px;
  height: 14px;
}

.agent-insight-card__nav-icon.is-prev {
  transform: rotate(90deg);
}

.agent-insight-card__nav-icon.is-next {
  transform: rotate(-90deg);
}

.agent-insight-card__action {
  min-height: 32px;
  padding: 0 11px;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-agent-primary-foreground, #fff);
  background: var(--varo-agent-primary, #0f766e);
  border: 1px solid var(--varo-agent-primary, #0f766e);
  border-radius: 9px;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
