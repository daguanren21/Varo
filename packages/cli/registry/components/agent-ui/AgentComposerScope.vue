<script setup lang="ts">
import type { AgentContextSource, AgentContextSourceStatus } from './advanced-types'
import { computed } from 'wevu'
import { agentPlugIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    sources?: AgentContextSource[]
    title?: string
    usagePercent?: number
  }>(),
  {
    disabled: false,
    sources: () => [],
    title: '可访问来源',
    usagePercent: 0,
  },
)

const emit = defineEmits<{
  connect: [source: AgentContextSource]
  toggle: [source: AgentContextSource, enabled: boolean]
}>()

const clampedUsage = computed(() => {
  const usage = Number.isFinite(props.usagePercent) ? props.usagePercent : 0
  return Math.min(100, Math.max(0, usage))
})
const usageWidth = computed(() => `${clampedUsage.value}%`)
const enabledCount = computed(() => props.sources.filter(source => source.enabled).length)
const headingHint = computed(() => {
  if (!props.sources.length) { return '暂无可用来源' }
  if (enabledCount.value === 0) { return '尚未授权任何来源' }
  return `${enabledCount.value} 个来源已加入上下文`
})
const countLabel = computed(() => `${enabledCount.value}/${props.sources.length}`)
const disabledActionClass = computed(() =>
  props.disabled ? 'agent-workspace-card__action--disabled' : '',
)
const displaySources = computed(() => props.sources.map((source) => {
  const status: AgentContextSourceStatus = source.status ?? 'available'
  const statusLabel = status === 'available' ? '可用' : status === 'connecting' ? '连接中' : '不可用'
  return {
    actionClass: source.enabled ? '' : 'agent-workspace-card__action--primary',
    canConnect: status === 'unavailable',
    canToggle: status === 'available',
    connectLabel: `连接${source.label}`,
    enabledAttr: String(source.enabled),
    rowClass: `agent-workspace-card__row is-${status}${source.enabled ? ' is-enabled' : ''}`,
    source,
    status,
    statusLabel,
    toggleLabel: `${source.enabled ? '停用' : '启用'}${source.label}`,
    toggleText: source.enabled ? '停用' : '启用',
  }
}))
</script>

<template>
  <view class="agent-composer-scope" :aria-label="title">
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

    <view v-if="displaySources.length" class="agent-workspace-card__body">
      <view
        v-for="item in displaySources"
        :key="item.source.id"
        :class="item.rowClass"
        :data-status="item.status"
        :data-enabled="item.enabledAttr"
      >
        <view class="agent-workspace-card__mark" aria-hidden="true">
          <image class="agent-workspace-card__icon" :src="agentPlugIcon" mode="aspectFit" />
        </view>
        <view class="agent-workspace-card__copy">
          <view class="agent-workspace-card__row-main">
            <text class="agent-workspace-card__name">
              {{ item.source.label }}
            </text>
            <text class="agent-workspace-card__chip">
              {{ item.statusLabel }}
            </text>
          </view>
          <text v-if="item.source.description || item.source.meta" class="agent-workspace-card__detail">
            {{ item.source.description || item.source.meta }}
          </text>
        </view>
        <button
          v-if="item.canToggle"
          class="agent-native-button agent-workspace-card__action"
          :class="[item.actionClass, disabledActionClass]"
          type="button"
          :disabled="disabled"
          :aria-label="item.toggleLabel"
          :aria-pressed="item.source.enabled"
          hover-class="agent-workspace-card__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('toggle', item.source, !item.source.enabled)"
        >
          {{ item.toggleText }}
        </button>
        <button
          v-else-if="item.canConnect"
          class="agent-native-button agent-workspace-card__action agent-workspace-card__action--primary"
          :class="disabledActionClass"
          type="button"
          :disabled="disabled"
          :aria-label="item.connectLabel"
          hover-class="agent-workspace-card__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('connect', item.source)"
        >
          连接
        </button>
        <text v-else class="agent-workspace-card__chip">
          连接中
        </text>
      </view>
    </view>
    <view v-else class="agent-workspace-card__empty">
      <text>暂无来源</text>
    </view>

    <view class="agent-composer-scope__meter">
      <view class="agent-workspace-card__row-main">
        <text class="agent-workspace-card__hint">
          上下文使用
        </text>
        <text class="agent-composer-scope__usage">
          {{ clampedUsage }}%
        </text>
      </view>
      <view
        class="agent-composer-scope__track"
        role="progressbar"
        aria-label="上下文使用量"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="clampedUsage"
      >
        <view class="agent-composer-scope__fill" :style="`width:${usageWidth}`" />
      </view>
    </view>
  </view>
</template>

<style>
.agent-composer-scope {
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

.agent-workspace-card__row.is-connecting,
.agent-workspace-card__row.is-enabled {
  background: color-mix(in srgb, var(--varo-agent-primary-soft, #ccfbf1) 42%, transparent);
}

.agent-workspace-card__row.is-failed,
.agent-workspace-card__row.is-unavailable {
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

.agent-workspace-card__row.is-available .agent-workspace-card__mark {
  background: var(--varo-agent-success-soft, #dcfce7);
  border-color: var(--varo-agent-success, #16a34a);
}

.agent-workspace-card__row.is-connecting .agent-workspace-card__mark {
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-color: var(--varo-agent-primary, #0f766e);
}

.agent-workspace-card__row.is-unavailable .agent-workspace-card__mark {
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

.agent-workspace-card__row.is-available .agent-workspace-card__chip {
  color: var(--varo-agent-success, #16a34a);
  background: var(--varo-agent-success-soft, #dcfce7);
}

.agent-workspace-card__row.is-connecting .agent-workspace-card__chip {
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-primary-soft, #ccfbf1);
}

.agent-workspace-card__row.is-unavailable .agent-workspace-card__chip {
  color: var(--varo-agent-danger, #dc2626);
  background: var(--varo-agent-danger-soft, #fee2e2);
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

.agent-workspace-card__action--disabled {
  opacity: 0.45;
}

.agent-composer-scope__meter {
  display: grid;
  gap: 8px;
  padding: 10px 14px 12px;
  border-top: 1px solid var(--varo-agent-border, #dbe3ea);
}

.agent-composer-scope__usage {
  font-size: 11px;
  font-weight: 760;
  font-variant-numeric: tabular-nums;
  color: var(--varo-agent-primary, #0f766e);
}

.agent-composer-scope__track {
  height: 6px;
  overflow: hidden;
  background: var(--varo-agent-fill, #f1f5f9);
  border-radius: 999px;
}

.agent-composer-scope__fill {
  height: 100%;
  background: var(--varo-agent-primary, #0f766e);
  border-radius: inherit;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
