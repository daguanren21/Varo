<script setup lang="ts">
import type { AgentRetrievalItem, AgentRetrievalStatus } from './advanced-types'
import { computed } from 'wevu'

const props = withDefaults(
  defineProps<{
    items?: AgentRetrievalItem[]
    title?: string
  }>(),
  {
    items: () => [],
    title: '检索进度',
  },
)

const emit = defineEmits<{
  retry: [item: AgentRetrievalItem]
}>()

function statusLabel(status: AgentRetrievalStatus) {
  if (status === 'queued') { return '排队中' }
  if (status === 'reading') { return '读取中' }
  if (status === 'read') { return '已读取' }
  if (status === 'skipped') { return '已跳过' }
  return '读取失败'
}

const settledCount = computed(() => props.items.filter(item => item.status === 'read' || item.status === 'skipped' || item.status === 'failed').length)
const currentItem = computed(() => props.items.find(item => item.status === 'reading' || item.status === 'failed'))
const headingHint = computed(() => {
  if (currentItem.value?.status === 'failed') { return `阻塞于 ${currentItem.value.title}` }
  if (currentItem.value) { return `正在读取 ${currentItem.value.title}` }
  if (props.items.length && settledCount.value === props.items.length) { return '检索已完成' }
  return '等待检索'
})
const countLabel = computed(() => `${settledCount.value}/${props.items.length}`)
const displayItems = computed(() => props.items.map((item, index) => ({
  canRetry: item.status === 'failed' && Boolean(item.retryable),
  indexLabel: String(index + 1).padStart(2, '0'),
  item,
  retryLabel: `重试${item.title}`,
  rowClass: `agent-workspace-card__row is-${item.status}`,
  showPulse: item.status === 'reading',
  statusLabel: statusLabel(item.status),
})))
</script>

<template>
  <view class="agent-retrieval" aria-live="polite" aria-atomic="false">
    <view class="agent-workspace-card__header">
      <view class="agent-workspace-card__heading">
        <text class="agent-workspace-card__title">
          {{ title }}
        </text>
        <text class="agent-workspace-card__hint">
          {{ headingHint }}
        </text>
      </view>
      <text class="agent-workspace-card__count">
        {{ countLabel }}
      </text>
    </view>

    <view v-if="displayItems.length" class="agent-workspace-card__body">
      <view
        v-for="entry in displayItems"
        :key="entry.item.id"
        :class="entry.rowClass"
        :data-status="entry.item.status"
      >
        <view class="agent-workspace-card__mark" aria-hidden="true">
          <view v-if="entry.showPulse" class="agent-retrieval__pulse" />
          <text v-else>
            {{ entry.indexLabel }}
          </text>
        </view>
        <view class="agent-workspace-card__copy">
          <view class="agent-workspace-card__row-main">
            <text class="agent-workspace-card__name">
              {{ entry.item.title }}
            </text>
            <text class="agent-workspace-card__chip">
              {{ entry.statusLabel }}
            </text>
          </view>
          <text v-if="entry.item.detail" class="agent-workspace-card__detail">
            {{ entry.item.detail }}
          </text>
        </view>
        <button
          v-if="entry.canRetry"
          class="agent-native-button agent-workspace-card__action agent-workspace-card__action--primary"
          type="button"
          :aria-label="entry.retryLabel"
          hover-class="agent-workspace-card__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('retry', entry.item)"
        >
          重试
        </button>
      </view>
    </view>
    <view v-else class="agent-workspace-card__empty">
      <text>暂无检索项</text>
    </view>
  </view>
</template>

<style>
.agent-retrieval {
  overflow: hidden;
  color: var(--varo-agent-foreground, #172033);
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 16px;
}

.agent-workspace-card__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 52px;
  padding: 12px 14px 11px;
  border-bottom: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-workspace-card__heading {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.agent-workspace-card__title {
  font-size: 13px;
  font-weight: 760;
  line-height: 18px;
}

.agent-workspace-card__hint,
.agent-workspace-card__count,
.agent-workspace-card__detail,
.agent-workspace-card__empty {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-workspace-card__count {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.agent-workspace-card__body {
  display: grid;
  padding: 8px 10px 10px;
}

.agent-workspace-card__row {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 58px;
  padding: 9px 10px;
  border-radius: 12px;
}

.agent-workspace-card__row.is-reading {
  background: color-mix(in srgb, var(--varo-agent-primary-soft, #ccfbf1) 42%, transparent);
}

.agent-workspace-card__row.is-failed {
  background: var(--varo-agent-danger-soft, #fee2e2);
}

.agent-workspace-card__mark {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 10px;
  font-weight: 800;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-fill, #f1f5f9);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 9px;
}

.agent-workspace-card__row.is-read .agent-workspace-card__mark {
  color: var(--varo-agent-success, #16a34a);
  background: var(--varo-agent-success-soft, #dcfce7);
  border-color: var(--varo-agent-success, #16a34a);
}

.agent-workspace-card__row.is-reading .agent-workspace-card__mark {
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-color: var(--varo-agent-primary, #0f766e);
}

.agent-workspace-card__row.is-failed .agent-workspace-card__mark {
  color: var(--varo-agent-danger, #dc2626);
  background: var(--varo-agent-danger-soft, #fee2e2);
  border-color: var(--varo-agent-danger, #dc2626);
}

.agent-retrieval__pulse {
  width: 7px;
  height: 7px;
  background: currentcolor;
  border-radius: 999px;
  animation: agent-retrieval-pulse 1s ease-in-out infinite;
}

.agent-workspace-card__copy {
  display: grid;
  flex: 1;
  gap: 4px;
  min-width: 0;
}

.agent-workspace-card__row-main {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.agent-workspace-card__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  white-space: nowrap;
}

.agent-workspace-card__chip {
  flex: none;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 750;
  line-height: 14px;
  color: var(--varo-agent-muted, #667085);
  background: var(--varo-agent-fill, #f1f5f9);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 999px;
}

.agent-workspace-card__row.is-read .agent-workspace-card__chip {
  color: var(--varo-agent-success, #16a34a);
  background: var(--varo-agent-success-soft, #dcfce7);
}

.agent-workspace-card__row.is-reading .agent-workspace-card__chip {
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
}

.agent-workspace-card__row.is-failed .agent-workspace-card__chip {
  color: var(--varo-agent-danger, #dc2626);
  background: var(--varo-agent-danger-soft, #fee2e2);
}

.agent-workspace-card__row.is-skipped .agent-workspace-card__chip {
  color: var(--varo-agent-warning, #b45309);
  background: var(--varo-agent-warning-soft, #fef3c7);
}

.agent-workspace-card__empty {
  display: grid;
  place-items: center;
  min-height: 72px;
  padding: 12px;
}

.agent-workspace-card__action {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 36px;
  padding: 0 10px;
  margin: 0;
  font-size: 11px;
  font-weight: 750;
  line-height: 1;
  color: var(--varo-agent-foreground, #172033);
  background: transparent;
  border: 0;
  border-radius: 9px;
}

.agent-workspace-card__action::before {
  position: absolute;
  inset: -4px;
  content: '';
}

.agent-workspace-card__action--primary {
  color: var(--varo-agent-primary, #0f766e);
}

.agent-workspace-card__action--pressed {
  background: var(--varo-agent-primary-soft, #ccfbf1);
}

@keyframes agent-retrieval-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-retrieval__pulse {
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
