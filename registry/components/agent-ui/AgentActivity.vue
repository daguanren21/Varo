<script setup lang="ts">
import type { ClassValue } from '../../lib/cn'
import type { AgentActivityItem, AgentAdvancedStatus } from './advanced-types'
import { computed } from 'wevu'
import { cn } from '../../lib/cn'
import { agentSearchIcon, agentSparklesIcon, agentToolIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    className?: ClassValue
    items?: AgentActivityItem[]
    title?: string
  }>(),
  {
    items: () => [],
    title: 'Agent activity',
  },
)

const rootClass = computed(() => cn('agent-activity', props.className))
const completedCount = computed(() => props.items.filter(item => item.status === 'completed').length)
const currentItem = computed(() => props.items.find(item => item.status === 'running' || item.status === 'failed'))
const headingHint = computed(() => {
  if (currentItem.value?.status === 'failed') {
    return `阻塞于 ${currentItem.value.title}`
  }
  if (currentItem.value) {
    return `正在执行 ${currentItem.value.title}`
  }
  if (props.items.length && completedCount.value === props.items.length) {
    return '全部完成'
  }
  return '等待开始'
})
const displayItems = computed(() =>
  props.items.map((item) => {
    const ariaCurrent: 'step' | undefined = item.status === 'running' ? 'step' : undefined
    return {
      ...item,
      ariaCurrent,
      itemClass: `agent-activity__item is-${item.status} is-${item.kind}`,
      kindLabel: item.kind === 'reasoning'
        ? '推理'
        : item.kind === 'search'
          ? '检索'
          : item.kind === 'tool'
            ? '工具'
            : '轨迹',
      kindIcon: item.kind === 'search'
        ? agentSearchIcon
        : item.kind === 'tool'
          ? agentToolIcon
          : agentSparklesIcon,
      statusChipClass: `agent-advanced__status is-${item.status}`,
      statusLabel: item.status === 'completed'
        ? 'Completed'
        : item.status === 'failed'
          ? 'Failed'
          : item.status === 'running'
            ? 'Running'
            : 'Waiting',
    }
  }),
)

function statusDotClass(status: AgentAdvancedStatus) {
  return cn(
    'agent-activity__status-dot',
    `is-${status}`,
    status === 'running' && 'agent-activity__running',
  )
}
</script>

<template>
  <view :class="rootClass" aria-live="polite">
    <view class="agent-activity__header">
      <view class="agent-activity__heading">
        <text class="agent-activity__title">
          {{ title }}
        </text>
        <text class="agent-activity__hint">
          {{ headingHint }}
        </text>
      </view>
      <text class="agent-activity__count">
        {{ completedCount }}/{{ items.length }}
      </text>
    </view>
    <view class="agent-activity__body">
      <view
        v-for="item in displayItems"
        :key="item.id"
        :class="item.itemClass"
        :data-kind="item.kind"
        :data-status="item.status"
        :aria-current="item.ariaCurrent"
      >
        <view class="agent-activity__kind" aria-hidden="true">
          <image class="agent-activity__kind-icon" :src="item.kindIcon" mode="aspectFit" />
        </view>
        <view class="agent-activity__copy">
          <view class="agent-activity__row">
            <text class="agent-activity__name">
              {{ item.title }}
            </text>
            <view :class="item.statusChipClass" :data-status="item.status">
              <view :class="statusDotClass(item.status)" aria-hidden="true" />
              <text>{{ item.statusLabel }}</text>
            </view>
          </view>
          <view class="agent-activity__meta">
            <text class="agent-activity__kind-label">
              {{ item.kindLabel }}
            </text>
            <text v-if="item.duration" class="agent-activity__duration">
              {{ item.duration }}
            </text>
          </view>
          <text v-if="item.detail" class="agent-activity__detail">
            {{ item.detail }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style>
.agent-activity {
  overflow: hidden;
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-activity__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 52px;
  padding: 12px 14px 11px;
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-activity__heading {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agent-activity__title {
  font-size: 13px;
  font-weight: 760;
  line-height: 18px;
  color: var(--varo-agent-foreground, #172033);
}

.agent-activity__hint,
.agent-activity__count,
.agent-activity__duration,
.agent-activity__detail {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-activity__count,
.agent-activity__duration {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.agent-activity__body {
  display: grid;
  padding: 8px 10px 12px;
}

.agent-activity__item {
  display: flex;
  gap: 10px;
  min-height: 58px;
  padding: 9px 10px;
  border-radius: 12px;
}

.agent-activity__item.is-running {
  background: var(--varo-agent-primary-soft, #ccfbf1);
}

.agent-activity__item.is-failed {
  background: var(--varo-agent-danger-soft, #fee2e2);
}

.agent-activity__kind {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--varo-agent-fill, #f1f5f9);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 9px;
}

.agent-activity__kind-icon {
  width: 14px;
  height: 14px;
}

.agent-activity__item.is-reasoning .agent-activity__kind {
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-color: var(--varo-agent-primary, #0f766e);
}

.agent-activity__item.is-search .agent-activity__kind {
  background: var(--varo-agent-source-blue-soft, #eff6ff);
  border-color: var(--varo-agent-source-blue, #2563eb);
}

.agent-activity__item.is-tool .agent-activity__kind {
  background: var(--varo-agent-source-violet-soft, #f5f3ff);
  border-color: var(--varo-agent-source-violet, #7c3aed);
}

.agent-activity__copy {
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 0;
}

.agent-activity__row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
}

.agent-activity__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  color: var(--varo-agent-foreground, #172033);
  white-space: nowrap;
}

.agent-advanced__status {
  display: flex;
  flex: none;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  font-weight: 750;
  color: var(--varo-agent-muted, #667085);
}

.agent-activity__status-dot {
  width: 7px;
  height: 7px;
  background: var(--varo-agent-border-strong, #cbd5e1);
  border-radius: 999px;
}

.agent-activity__status-dot.is-completed {
  background: var(--varo-agent-success, #16a34a);
}

.agent-activity__status-dot.is-running {
  background: var(--varo-agent-primary, #0f766e);
}

.agent-activity__status-dot.is-failed {
  background: var(--varo-agent-danger, #dc2626);
}

.agent-activity__meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.agent-activity__kind-label {
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 750;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-fill, #f1f5f9);
  border-radius: 999px;
}

.agent-activity__running {
  animation: agent-activity-pulse 1s ease-in-out infinite;
}

@keyframes agent-activity-pulse {
  50% {
    opacity: 0.35;
    transform: scale(0.72);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-activity__running {
    animation: none;
  }
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
