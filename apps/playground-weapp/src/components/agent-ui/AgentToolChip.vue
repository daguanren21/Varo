<script setup lang="ts">
import type { AgentToolCall } from './types'
import VTag from '../ui/tag.vue'

withDefaults(
  defineProps<{
    compact?: boolean
    tool: AgentToolCall
  }>(),
  {
    compact: false,
  },
)

function markClass(status: AgentToolCall['status']) {
  if (status === 'completed') { return 'bg-[var(--varo-agent-success)]' }
  if (status === 'failed') { return 'bg-[var(--varo-agent-danger)]' }
  if (status === 'waiting') { return 'bg-[var(--varo-agent-border-strong)]' }
  return 'agent-tool__running bg-[var(--varo-agent-primary)] shadow-[0_0_0_3px_#ccfbf1]'
}
</script>

<template>
  <VTag class="agent-tool max-w-full gap-2 bg-[var(--varo-agent-surface)] text-[var(--varo-agent-text)]" size="sm" variant="outline">
    <text class="h-2 w-2 flex-none rounded-full" :class="[markClass(tool.status)]" aria-hidden="true" />
    <view class="grid min-w-0 flex-1 gap-px">
      <text class="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-bold text-[var(--varo-agent-foreground)]">
        {{ tool.name }}
      </text>
      <text v-if="tool.summary && !compact" class="text-[11px] text-[var(--varo-agent-muted)]">
        {{ tool.summary }}
      </text>
    </view>
    <text v-if="!compact" class="flex-none text-[11px] text-[var(--varo-agent-muted)]">
      {{ tool.status === 'completed' ? '完成' : tool.status === 'failed' ? '失败' : tool.status === 'waiting' ? '等待' : '运行中' }}
    </text>
  </VTag>
</template>

<style>
.agent-tool__running {
  animation: agent-tool-pulse 1s ease-in-out infinite;
}

@keyframes agent-tool-pulse {
  50% {
    opacity: 0.5;
    transform: scale(0.72);
  }
}

@media (prefers-reduced-motion: reduce) {
  .agent-tool__running {
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
