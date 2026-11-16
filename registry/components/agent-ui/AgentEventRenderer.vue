<script setup lang="ts">
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import { computed } from 'wevu'
import { agentSnapshotProjection, agentStreamNotice } from './presentation'
import AgentApproval from './AgentApproval.vue'
import AgentLoading from './AgentLoading.vue'
import AgentMessage from './AgentMessage.vue'
import AgentThinking from './AgentThinking.vue'
import AgentToolChip from './AgentToolChip.vue'

const props = defineProps<{
  snapshot: ChatClientSnapshot
}>()

const emit = defineEmits<{
  approve: [interruptId: string]
  reject: [interruptId: string]
  retry: []
}>()
const projection = computed(() => agentSnapshotProjection(props.snapshot))
</script>

<template>
  <view class="agent-event-renderer grid gap-3" :data-status="projection.status">
    <AgentThinking v-if="projection.reasoning.length" label="推理过程" :default-open="projection.status === 'streaming'" :steps="projection.reasoning" />

    <view v-if="projection.tools.length" class="flex flex-wrap gap-2">
      <AgentToolChip v-for="tool in projection.tools" :key="tool.id" :tool="tool" />
    </view>

    <AgentMessage
      v-if="projection.message || projection.error"
      :role="projection.messageRole"
      :stream="true"
      :stream-content="projection.messageText"
      :stream-error="projection.error"
      :stream-final="projection.messageFinal"
      :stream-status="projection.status"
      @retry="emit('retry')"
    />
    <view v-if="projection.status === 'waiting' && !projection.message && !projection.error && !projection.approval" class="text-xs text-[var(--varo-agent-muted)]" role="status">
      <text>{{ agentStreamNotice(projection.status) }}</text>
    </view>

    <AgentLoading v-if="projection.status === 'streaming' && !projection.messageText" label="正在生成回答" />

    <AgentApproval
      v-if="projection.approval"
      :key="projection.approval.id"
      :choices="projection.approval.choices"
      :description="projection.approval.description"
      :title="projection.approval.title"
      @approve="emit('approve', projection.approval.id)"
      @reject="emit('reject', projection.approval.id)"
    />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
