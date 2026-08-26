<script setup lang="ts">
import VTag from '../ui/tag.vue'
import type { AgentToolCall } from './types'

withDefaults(
  defineProps<{
    compact?: boolean
    tool: AgentToolCall
  }>(),
  {
    compact: false
  }
)

function markClass(status: AgentToolCall['status']) {
  if (status === 'completed') return 'bg-green-600'
  if (status === 'failed') return 'bg-red-600'
  if (status === 'waiting') return 'bg-slate-300'
  return 'agent-tool__running bg-teal-700 shadow-[0_0_0_3px_#ccfbf1]'
}
</script>

<template>
  <VTag class="agent-tool max-w-full gap-2 bg-white text-slate-600" size="sm" variant="outline">
    <text :class="['h-2 w-2 flex-none rounded-full', markClass(tool.status)]" aria-hidden="true" />
    <view class="grid min-w-0 flex-1 gap-px">
      <text class="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-bold text-slate-700">{{ tool.name }}</text>
      <text v-if="tool.summary && !compact" class="text-[10px] text-slate-400">{{ tool.summary }}</text>
    </view>
    <text v-if="!compact" class="flex-none text-[10px] text-slate-400">
      {{ tool.status === 'completed' ? '完成' : tool.status === 'failed' ? '失败' : tool.status === 'waiting' ? '等待' : '运行中' }}
    </text>
  </VTag>
</template>

<style scoped>
.agent-tool__running { animation: agent-tool-pulse 1s ease-in-out infinite; }
@keyframes agent-tool-pulse { 50% { transform: scale(.72); opacity: .5; } }
@media (prefers-reduced-motion: reduce) { .agent-tool__running { animation: none; } }
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
