<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import { computed } from 'wevu'
import { agentBranchIcon } from './agent-icons'

const props = withDefaults(
  defineProps<{
    activeId?: string
    title?: string
    versions?: readonly AgentThreadVersion[]
  }>(),
  {
    activeId: '',
    title: '会话版本',
    versions: () => [],
  },
)

const emit = defineEmits<{
  branch: [version: AgentThreadVersion]
  pin: [version: AgentThreadVersion]
  select: [version: AgentThreadVersion]
}>()

const displayVersions = computed(() => {
  const labels = new Map<string, string>()
  props.versions.forEach((version, index) => {
    labels.set(version.id, version.label || `版本 ${index + 1}`)
  })
  return props.versions.map((version, index) => {
    const active = version.id === props.activeId
    const label = version.label || `版本 ${index + 1}`
    return {
      active,
      activeAttr: String(active),
      branchLabel: `从${label}创建分支`,
      cardStateClass: active ? 'agent-thread-versions__card--active' : '',
      label,
      parentLabel: version.parentId ? labels.get(version.parentId) || version.parentId : '起始版本',
      pinLabel: `固定${label}`,
      selectLabel: `选择${label}`,
      summary: version.summary || '暂无版本摘要',
      version,
    }
  })
})
const headingHint = computed(() => {
  const active = displayVersions.value.find(entry => entry.active)
  return active ? `当前 ${active.label}` : '选择一个会话版本'
})
const countLabel = computed(() => `${props.versions.length} 个版本`)
</script>

<template>
  <view class="agent-thread-versions" :aria-label="title">
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

    <view v-if="displayVersions.length" class="agent-thread-versions__list" role="list" aria-label="会话版本列表">
      <view
        v-for="entry in displayVersions"
        :key="entry.version.id"
        class="agent-thread-versions__card box-border grid w-full min-w-0 max-w-full gap-2"
        :class="entry.cardStateClass"
        :data-active="entry.activeAttr"
        role="listitem"
      >
        <view class="agent-workspace-card__row-main">
          <view class="agent-workspace-card__mark" aria-hidden="true">
            <image class="agent-workspace-card__icon" :src="agentBranchIcon" mode="aspectFit" />
          </view>
          <text class="agent-workspace-card__name">
            {{ entry.label }}
          </text>
          <text v-if="entry.active" class="agent-workspace-card__chip">
            当前
          </text>
          <text v-else-if="entry.version.pinned" class="agent-workspace-card__chip">
            已固定
          </text>
        </view>
        <text class="agent-workspace-card__detail">
          {{ entry.summary }}
        </text>
        <view class="agent-thread-versions__meta">
          <text>来源：{{ entry.parentLabel }}</text>
          <text v-if="entry.version.createdAt">
            创建：{{ entry.version.createdAt }}
          </text>
        </view>
        <view class="agent-thread-versions__actions">
          <button
            v-if="!entry.active"
            class="agent-native-button agent-workspace-card__action agent-workspace-card__action--primary"
            type="button"
            :aria-label="entry.selectLabel"
            hover-class="agent-workspace-card__action--pressed"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="emit('select', entry.version)"
          >
            选择
          </button>
          <button
            class="agent-native-button agent-workspace-card__action"
            type="button"
            :aria-label="entry.branchLabel"
            hover-class="agent-workspace-card__action--pressed"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="emit('branch', entry.version)"
          >
            分支
          </button>
          <button
            v-if="!entry.version.pinned"
            class="agent-native-button agent-workspace-card__action"
            type="button"
            :aria-label="entry.pinLabel"
            hover-class="agent-workspace-card__action--pressed"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="emit('pin', entry.version)"
          >
            固定
          </button>
        </view>
      </view>
    </view>
    <view v-else class="agent-workspace-card__empty">
      <text>暂无会话版本</text>
    </view>
  </view>
</template>

<style>
.agent-thread-versions {
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
.agent-workspace-card__empty,
.agent-thread-versions__meta {
  font-size: 11px;
  line-height: 16px;
  color: var(--varo-agent-muted, #667085);
}

.agent-workspace-card__count {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.agent-thread-versions__list {
  display: grid;
  gap: 8px;
  padding: 10px;
}

.agent-thread-versions__card {
  padding: 12px;
  background: var(--varo-agent-surface-strong, #f8fafc);
  border: 1px solid var(--varo-agent-border, #dbe3ea);
  border-radius: 14px;
}

.agent-thread-versions__card--active {
  background: var(--varo-agent-primary-soft, #ccfbf1);
  border-color: var(--varo-agent-primary, #0f766e);
}

.agent-workspace-card__row-main {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
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
  color: var(--varo-agent-primary, #0f766e);
  background: var(--varo-agent-surface, #fff);
  border: 1px solid var(--varo-agent-primary, #0f766e);
  border-radius: 999px;
}

.agent-thread-versions__meta,
.agent-thread-versions__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.agent-thread-versions__actions {
  padding-top: 8px;
  border-top: 1px solid var(--varo-agent-border, #dbe3ea);
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
