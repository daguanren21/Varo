<script setup lang="ts">
import type { AgentApprovalDisplay, AgentInterruptIdentity, AgentSnapshotProjection } from './presentation'
import { computed } from 'wevu'
import VButton from '../ui/v-button.vue'
import AgentApproval from './AgentApproval.vue'

const props = defineProps<{ projection: AgentSnapshotProjection }>()
const emit = defineEmits<{
  approve: [identity: AgentInterruptIdentity]
  reject: [identity: AgentInterruptIdentity]
  retryInterrupts: [transactionKey: string]
  cancelInterrupts: [transactionKey: string]
}>()
// The parent keys this child by transaction. Queued native events retain that transaction's identity.
const transactionKey = props.projection.transactionKey
const identities = new Map(props.projection.approvals.map(({ id, threadId, interruptedRunId, generation }) => [id, { id, threadId, interruptedRunId, generation }]))
const approvals = computed(() => props.projection.approvals.map(approval => ({
  ...approval,
  key: JSON.stringify([approval.id, approval.threadId, approval.interruptedRunId, approval.generation]),
  disabled: !approval.canResolve,
})))
function resolve(approval: AgentApprovalDisplay, action: 'approve' | 'reject') {
  const identity = identities.get(approval.id)
  if (!approval.canResolve || !identity || identity.threadId !== approval.threadId
    || identity.interruptedRunId !== approval.interruptedRunId || identity.generation !== approval.generation) { return }
  if (action === 'approve') { emit('approve', identity) }
  else { emit('reject', identity) }
}
function retry() {
  if (props.projection.canRetryInterrupts) { emit('retryInterrupts', transactionKey) }
}
function cancel() {
  if (props.projection.canCancelInterrupts) { emit('cancelInterrupts', transactionKey) }
}
</script>

<template>
  <view class="flex min-w-0 flex-col gap-3">
    <AgentApproval
      v-for="approval in approvals"
      :key="approval.key"
      :description="approval.description"
      :title="approval.title"
      :preview="approval.preview"
      :disabled="approval.disabled"
      @approve="resolve(approval, 'approve')"
      @reject="resolve(approval, 'reject')"
    />
    <text v-for="error in projection.interruptErrors" :key="error" class="whitespace-pre-wrap break-words text-xs text-[var(--varo-agent-danger)]" role="alert">
      {{ error }}
    </text>
    <view v-if="projection.canRetryInterrupts || projection.canCancelInterrupts" class="flex flex-wrap gap-2">
      <VButton v-if="projection.canRetryInterrupts" variant="outline" @click="retry">
        重试中断
      </VButton>
      <VButton v-if="projection.canCancelInterrupts" variant="outline" @click="cancel">
        取消中断
      </VButton>
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
