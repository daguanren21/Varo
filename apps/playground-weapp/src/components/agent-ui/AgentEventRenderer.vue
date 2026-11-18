<script setup lang="ts">
import type { ChatClientSnapshot } from '@tanstack/ai-client'
import type { AgentInterruptIdentity } from './presentation'
import type { AgentToolCallPreview } from './types'
import { computed } from 'wevu'
import AgentInterruptControls from './AgentInterruptControls.vue'
import AgentLoading from './AgentLoading.vue'
import AgentMessageParts from './AgentMessageParts.vue'
import AgentStream from './AgentStream.vue'
import { agentCanResolveApproval, agentSnapshotProjection, agentStreamNotice } from './presentation'

const props = withDefaults(defineProps<{
  snapshot: ChatClientSnapshot
  toolCallPreviews?: Readonly<Record<string, AgentToolCallPreview>>
  retryable?: boolean
}>(), { retryable: true })

const emit = defineEmits<{
  approve: [interruptId: string]
  reject: [interruptId: string]
  retry: []
  retryInterrupts: []
  cancelInterrupts: []
}>()
const projection = computed(() => agentSnapshotProjection(props.snapshot, 'summary'))
// Native hosts replace keyed list items; a key on a static component does not remount it.
const interruptTransactions = computed(() => [projection.value])
function retry() {
  if (props.retryable) { emit('retry') }
}
function approve(identity: AgentInterruptIdentity) {
  if (agentCanResolveApproval(props.snapshot, identity)) { emit('approve', identity.id) }
}
function reject(identity: AgentInterruptIdentity) {
  if (agentCanResolveApproval(props.snapshot, identity)) { emit('reject', identity.id) }
}
function retryInterrupts(transactionKey: string) {
  const current = projection.value
  if (current.transactionKey === transactionKey && current.canRetryInterrupts) { emit('retryInterrupts') }
}
function cancelInterrupts(transactionKey: string) {
  const current = projection.value
  if (current.transactionKey === transactionKey && current.canCancelInterrupts) { emit('cancelInterrupts') }
}
</script>

<template>
  <view class="agent-event-renderer grid gap-3" :data-status="projection.status">
    <AgentMessageParts v-if="projection.renderedMessage" :message="projection.renderedMessage" :tool-call-previews="toolCallPreviews" :stream="true" :error="projection.error" :retryable="retryable" @retry="retry" />
    <AgentStream v-else-if="projection.error" :error="projection.error" status="failed" :retryable="retryable" @retry="retry" />
    <view v-if="projection.status === 'waiting' && !projection.message && !projection.error && !projection.approvals.length" class="text-xs text-[var(--varo-agent-muted)]" role="status">
      <text>{{ agentStreamNotice(projection.status) }}</text>
    </view>

    <AgentLoading v-if="projection.status === 'streaming' && !projection.messageText" label="正在生成回答" />

    <AgentInterruptControls
      v-for="transaction in interruptTransactions"
      :key="transaction.transactionKey"
      :projection="transaction"
      @approve="approve"
      @reject="reject"
      @retryInterrupts="retryInterrupts"
      @cancelInterrupts="cancelInterrupts"
    />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
