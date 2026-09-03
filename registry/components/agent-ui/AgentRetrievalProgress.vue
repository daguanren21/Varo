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
const displayItems = computed(() => props.items.map(item => ({
  canRetry: item.status === 'failed' && Boolean(item.retryable),
  item,
  statusLabel: statusLabel(item.status),
})))
</script>

<template>
  <view class="agent-retrieval box-border w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]" aria-live="polite" aria-atomic="false">
    <view class="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--varo-agent-border)] px-[13px]">
      <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
        {{ title }}
      </text>
      <text class="text-[11px] tabular-nums text-[var(--varo-agent-muted)]">
        {{ settledCount }}/{{ items.length }} 已处理
      </text>
    </view>

    <view v-if="displayItems.length" class="grid gap-1 p-2">
      <view
        v-for="entry in displayItems"
        :key="entry.item.id"
        class="flex min-h-[56px] items-center gap-2.5 rounded-xl px-2.5 py-2"
        :data-status="entry.item.status"
      >
        <view class="agent-retrieval__status-icon" aria-hidden="true" />
        <view class="grid min-w-0 flex-1 gap-0.5">
          <text class="truncate text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
            {{ entry.item.title }}
          </text>
          <text v-if="entry.item.detail" class="text-[11px] leading-4 text-[var(--varo-agent-muted)]">
            {{ entry.item.detail }}
          </text>
        </view>
        <view class="grid flex-none justify-items-end gap-0">
          <text class="text-[10px] font-semibold text-[var(--varo-agent-text)]">
            {{ entry.statusLabel }}
          </text>
          <button
            v-if="entry.canRetry"
            class="agent-retrieval__action"
            type="button"
            :aria-label="`重试${entry.item.title}`"
            hover-class="agent-retrieval__action--pressed"
            :hover-start-time="20"
            :hover-stay-time="70"
            @click="emit('retry', entry.item)"
          >
            重试
          </button>
        </view>
      </view>
    </view>
    <view v-else class="grid min-h-20 place-items-center px-3 text-[12px] text-[var(--varo-agent-muted)]">
      <text>暂无检索项</text>
    </view>
  </view>
</template>

<style scoped>
.agent-retrieval__status-icon {
  box-sizing: border-box;
  flex: none;
  width: 12px;
  height: 12px;
  background: var(--varo-agent-surface);
  border: 2px solid var(--varo-agent-border-strong);
  border-radius: 999px;
}

[data-status='reading'] .agent-retrieval__status-icon {
  background: var(--varo-agent-primary);
  border-color: var(--varo-agent-primary);
  box-shadow: 0 0 0 3px var(--varo-agent-primary-soft);
}

[data-status='read'] .agent-retrieval__status-icon {
  background: var(--varo-agent-success);
  border-color: var(--varo-agent-success);
}

[data-status='skipped'] .agent-retrieval__status-icon {
  height: 4px;
  background: var(--varo-agent-border-strong);
  border: 0;
  border-radius: 2px;
}

[data-status='failed'] .agent-retrieval__status-icon {
  background: var(--varo-agent-danger);
  border-color: var(--varo-agent-danger);
}

.agent-retrieval__action {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 24px;
  margin: 0;
  padding: 0 4px;
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
  color: var(--varo-agent-primary);
  background: transparent;
  border: 0;
  border-radius: 8px;
}

.agent-retrieval__action::before {
  position: absolute;
  inset: -10px -4px;
  content: '';
}

.agent-retrieval__action::after {
  border: 0;
}

.agent-retrieval__action--pressed {
  background: var(--varo-agent-primary-soft);
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
