<script setup lang="ts">
import type { AgentSourceReceiptItem } from './advanced-types'
import { computed } from 'wevu'
import { agentReceiptIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    items?: AgentSourceReceiptItem[]
    summary?: string
    title?: string
  }>(),
  {
    items: () => [],
    summary: '',
    title: '来源回执',
  },
)

const emit = defineEmits<{
  connect: [item: AgentSourceReceiptItem]
  open: [item: AgentSourceReceiptItem]
}>()

const readCount = computed(() => props.items.filter(item => item.status === 'read').length)
const failedCount = computed(() => props.items.filter(item => item.status === 'failed').length)
const headingHint = computed(() => {
  if (failedCount.value) { return `${failedCount.value} 个来源读取失败` }
  if (props.summary) { return props.summary }
  if (props.items.length && readCount.value === props.items.length) { return '全部来源已核对' }
  return '回答完成后核对来源'
})
const countLabel = computed(() => `${readCount.value}/${props.items.length}`)
const displayItems = computed(() => props.items.map((item) => {
  const statusLabel = item.status === 'read' ? '已读取' : item.status === 'skipped' ? '已跳过' : '读取失败'
  return {
    canConnect: item.status === 'failed',
    canOpen: item.status === 'read',
    connectLabel: `连接${item.label}`,
    countLabel: item.itemCount === undefined ? '' : `${item.itemCount} 项`,
    item,
    openLabel: `查看${item.label}`,
    rowClass: `agent-workspace-card__row is-${item.status}`,
    statusLabel,
  }
}))
</script>

<template>
  <view class="agent-source-receipt" :aria-label="title">
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
          <image class="agent-workspace-card__icon" :src="agentReceiptIcon" mode="aspectFit" />
        </view>
        <view class="agent-workspace-card__copy">
          <view class="agent-workspace-card__row-main">
            <text class="agent-workspace-card__name">
              {{ entry.item.label }}
            </text>
            <text v-if="entry.countLabel" class="agent-workspace-card__meta">
              {{ entry.countLabel }}
            </text>
          </view>
          <text v-if="entry.item.detail" class="agent-workspace-card__detail">
            {{ entry.item.detail }}
          </text>
          <text class="agent-workspace-card__chip">
            {{ entry.statusLabel }}
          </text>
        </view>
        <button
          v-if="entry.canOpen"
          class="agent-native-button agent-workspace-card__action"
          type="button"
          :aria-label="entry.openLabel"
          hover-class="agent-workspace-card__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('open', entry.item)"
        >
          查看
        </button>
        <button
          v-else-if="entry.canConnect"
          class="agent-native-button agent-workspace-card__action agent-workspace-card__action--primary"
          type="button"
          :aria-label="entry.connectLabel"
          hover-class="agent-workspace-card__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('connect', entry.item)"
        >
          连接
        </button>
      </view>
    </view>
    <view v-else class="agent-workspace-card__empty">
      <text>暂无来源回执</text>
    </view>
  </view>
</template>

<style>
.agent-source-receipt {
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
.agent-workspace-card__meta,
.agent-workspace-card__empty {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-workspace-card__count,
.agent-workspace-card__meta {
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
  background: var(--varo-agent-fill, #f1f5f9);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 9px;
}

.agent-workspace-card__icon {
  width: 14px;
  height: 14px;
}

.agent-workspace-card__row.is-read .agent-workspace-card__mark {
  background: var(--varo-agent-success-soft, #dcfce7);
  border-color: var(--varo-agent-success, #16a34a);
}

.agent-workspace-card__row.is-failed .agent-workspace-card__mark {
  background: var(--varo-agent-danger-soft, #fee2e2);
  border-color: var(--varo-agent-danger, #dc2626);
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
  width: fit-content;
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
  background: var(--varo-agent-fill, #f1f5f9);
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
