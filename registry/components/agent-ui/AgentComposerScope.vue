<script setup lang="ts">
import type { AgentContextSource, AgentContextSourceStatus } from './advanced-types'
import { computed } from 'wevu'

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
const usageTransform = computed(() => `scaleX(${clampedUsage.value / 100})`)
const enabledCount = computed(() => props.sources.filter(source => source.enabled).length)
const displaySources = computed(() => props.sources.map((source) => {
  const status: AgentContextSourceStatus = source.status ?? 'available'
  const statusLabel = status === 'available' ? '可用' : status === 'connecting' ? '连接中' : '不可用'
  return {
    canConnect: status === 'unavailable',
    canToggle: status === 'available',
    enabledLabel: source.enabled ? '已启用' : '未启用',
    source,
    status,
    statusLabel,
    toggleLabel: `${source.enabled ? '停用' : '启用'}${source.label}`,
  }
}))
</script>

<template>
  <view class="agent-composer-scope box-border w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-[13px]">
      <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text class="text-[11px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ enabledCount }} 个已启用
      </text>
    </view>

    <view v-if="displaySources.length" class="grid gap-1 p-2">
      <view
        v-for="item in displaySources"
        :key="item.source.id"
        class="flex min-h-[58px] items-center gap-2.5 rounded-xl bg-[var(--varo-agent-surface-strong)] px-2.5 py-2"
        :data-status="item.status"
      >
        <view class="agent-composer-scope__status-dot" aria-hidden="true" />
        <view class="grid min-w-0 flex-1 gap-0.5">
          <view class="flex min-w-0 items-center gap-2">
            <text class="truncate text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
              {{ item.source.label }}
            </text>
            <text class="flex-none text-[10px] font-semibold text-[var(--varo-agent-text)]">
              {{ item.enabledLabel }}
            </text>
            <text class="flex-none text-[10px] font-semibold text-[var(--varo-agent-muted)]">
              {{ item.statusLabel }}
            </text>
          </view>
          <text v-if="item.source.description || item.source.meta" class="truncate text-[11px] text-[var(--varo-agent-muted)]">
            {{ item.source.description || item.source.meta }}
          </text>
        </view>
        <button
          v-if="item.canToggle"
          class="agent-composer-scope__action"
          type="button"
          :disabled="disabled"
          :aria-label="item.toggleLabel"
          :aria-pressed="item.source.enabled"
          hover-class="agent-composer-scope__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('toggle', item.source, !item.source.enabled)"
        >
          {{ item.source.enabled ? '停用' : '启用' }}
        </button>
        <button
          v-else-if="item.canConnect"
          class="agent-composer-scope__action agent-composer-scope__action--primary"
          type="button"
          :disabled="disabled"
          :aria-label="`连接${item.source.label}`"
          hover-class="agent-composer-scope__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('connect', item.source)"
        >
          连接
        </button>
      </view>
    </view>
    <view v-else class="grid min-h-20 place-items-center px-3 text-[12px] text-[var(--varo-agent-muted)]">
      <text>暂无来源</text>
    </view>

    <view class="grid gap-2 border-t border-[var(--varo-agent-border)] px-[13px] py-3">
      <view class="flex items-center justify-between gap-3">
        <text class="text-[11px] font-semibold text-[var(--varo-agent-text)]">
          上下文使用
        </text>
        <text class="text-[11px] font-bold tabular-nums text-[var(--varo-agent-primary)]">
          {{ clampedUsage }}%
        </text>
      </view>
      <view
        class="h-1.5 overflow-hidden rounded-full bg-[var(--varo-agent-fill)]"
        role="progressbar"
        aria-label="上下文使用量"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="clampedUsage"
      >
        <view class="agent-composer-scope__meter h-full w-full rounded-full bg-[var(--varo-agent-primary)]" :style="{ transform: usageTransform }" />
      </view>
    </view>
  </view>
</template>

<style scoped>
.agent-composer-scope__status-dot {
  flex: none;
  width: 8px;
  height: 8px;
  background: var(--varo-agent-success);
  border-radius: 999px;
}

[data-status='connecting'] .agent-composer-scope__status-dot {
  background: var(--varo-agent-primary);
  box-shadow: 0 0 0 3px var(--varo-agent-primary-soft);
}

[data-status='unavailable'] .agent-composer-scope__status-dot {
  background: var(--varo-agent-danger);
}

.agent-composer-scope__action {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 36px;
  margin: 0;
  padding: 0 10px;
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
  color: var(--varo-agent-text);
  background: transparent;
  border: 0;
  border-radius: 8px;
}

.agent-composer-scope__action::before {
  position: absolute;
  inset: -4px;
  content: '';
}

.agent-composer-scope__action::after {
  border: 0;
}

.agent-composer-scope__action--primary {
  color: var(--varo-agent-primary);
}

.agent-composer-scope__action--pressed {
  background: var(--varo-agent-fill);
}

.agent-composer-scope__action[disabled] {
  opacity: 0.45;
}

.agent-composer-scope__meter {
  transition: transform 180ms ease-out;
  transform-origin: left center;
}

@media (prefers-reduced-motion: reduce) {
  .agent-composer-scope__meter {
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
