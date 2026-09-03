<script setup lang="ts">
import type { AgentSourceReceiptItem } from './advanced-types'
import { computed } from 'wevu'

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

const displayItems = computed(() => props.items.map((item) => {
  const statusLabel = item.status === 'read' ? '已读取' : item.status === 'skipped' ? '已跳过' : '读取失败'
  return {
    canConnect: item.status === 'failed',
    canOpen: item.status === 'read',
    item,
    statusLabel,
  }
}))
const readCount = computed(() => props.items.filter(item => item.status === 'read').length)
</script>

<template>
  <view class="agent-source-receipt box-border w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)]">
    <view class="grid min-h-12 gap-0.5 border-b border-[var(--varo-agent-border)] px-[13px] py-2.5">
      <view class="flex items-center justify-between gap-3">
        <text class="text-xs font-bold text-[var(--varo-agent-foreground)]">
          {{ title }}
        </text>
        <text class="text-[11px] tabular-nums text-[var(--varo-agent-muted)]">
          {{ readCount }}/{{ items.length }} 已读取
        </text>
      </view>
      <text v-if="summary" class="text-[11px] leading-4 text-[var(--varo-agent-muted)]">
        {{ summary }}
      </text>
    </view>

    <view v-if="displayItems.length" class="grid gap-1 p-2">
      <view
        v-for="entry in displayItems"
        :key="entry.item.id"
        class="flex min-h-[56px] items-center gap-2.5 rounded-xl bg-[var(--varo-agent-surface-strong)] px-2.5 py-2"
        :data-status="entry.item.status"
      >
        <view class="agent-source-receipt__status-icon" aria-hidden="true" />
        <view class="grid min-w-0 flex-1 gap-0.5">
          <view class="flex min-w-0 items-baseline gap-2">
            <text class="truncate text-[12px] font-semibold text-[var(--varo-agent-foreground)]">
              {{ entry.item.label }}
            </text>
            <text v-if="entry.item.itemCount !== undefined" class="flex-none text-[10px] tabular-nums text-[var(--varo-agent-muted)]">
              {{ entry.item.itemCount }} 项
            </text>
          </view>
          <text v-if="entry.item.detail" class="text-[11px] leading-4 text-[var(--varo-agent-muted)]">
            {{ entry.item.detail }}
          </text>
          <text class="text-[10px] font-semibold text-[var(--varo-agent-text)]">
            {{ entry.statusLabel }}
          </text>
        </view>
        <button
          v-if="entry.canOpen"
          class="agent-source-receipt__action"
          type="button"
          :aria-label="`查看${entry.item.label}`"
          hover-class="agent-source-receipt__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('open', entry.item)"
        >
          查看
        </button>
        <button
          v-else-if="entry.canConnect"
          class="agent-source-receipt__action agent-source-receipt__action--primary"
          type="button"
          :aria-label="`连接${entry.item.label}`"
          hover-class="agent-source-receipt__action--pressed"
          :hover-start-time="20"
          :hover-stay-time="70"
          @click="emit('connect', entry.item)"
        >
          连接
        </button>
      </view>
    </view>
    <view v-else class="grid min-h-20 place-items-center px-3 text-[12px] text-[var(--varo-agent-muted)]">
      <text>暂无来源回执</text>
    </view>
  </view>
</template>

<style scoped>
.agent-source-receipt__status-icon {
  box-sizing: border-box;
  flex: none;
  width: 12px;
  height: 12px;
  background: var(--varo-agent-success);
  border: 2px solid var(--varo-agent-success);
  border-radius: 999px;
}

[data-status='skipped'] .agent-source-receipt__status-icon {
  height: 4px;
  background: var(--varo-agent-border-strong);
  border: 0;
  border-radius: 2px;
}

[data-status='failed'] .agent-source-receipt__status-icon {
  background: var(--varo-agent-danger);
  border-color: var(--varo-agent-danger);
}

.agent-source-receipt__action {
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

.agent-source-receipt__action::before {
  position: absolute;
  inset: -4px;
  content: '';
}

.agent-source-receipt__action::after {
  border: 0;
}

.agent-source-receipt__action--primary {
  color: var(--varo-agent-primary);
}

.agent-source-receipt__action--pressed {
  background: var(--varo-agent-fill);
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
