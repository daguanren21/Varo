<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentChoice } from './types'
import { computed } from 'wevu'
import AgentApproval from './AgentApproval.vue'
import AgentLoading from './AgentLoading.vue'
import AgentMessage from './AgentMessage.vue'
import AgentThinking from './AgentThinking.vue'
import AgentToolChip from './AgentToolChip.vue'

const props = defineProps<{
  snapshot: AgentStreamSnapshot
}>()

const emit = defineEmits<{
  approve: [value: string]
  reject: []
  retry: []
}>()
const emptyChoices: AgentChoice[] = []

const streamStatus = computed<'completed' | 'failed' | 'idle' | 'streaming'>(() => {
  if (props.snapshot.status === 'completed') {
    return 'completed'
  }
  if (props.snapshot.status === 'failed' || props.snapshot.status === 'cancelled') {
    return 'failed'
  }
  if (props.snapshot.status === 'idle') {
    return 'idle'
  }
  return 'streaming'
})
const choices = computed<AgentChoice[]>(() => props.snapshot.approval?.choices ?? emptyChoices)
const messageContent = computed(() => String(props.snapshot.message?.visible ?? ''))
const messageError = computed(() => String(props.snapshot.error?.message ?? ''))
const approvalDescription = computed(() => String(props.snapshot.approval?.description ?? ''))
const approvalTitle = computed(() => String(props.snapshot.approval?.title ?? ''))
const approvalId = computed(() => props.snapshot.approval?.id ?? '')
const showApproval = computed(() => props.snapshot.approval?.status === 'waiting')
</script>

<template>
  <view class="agent-event-renderer grid gap-3" :data-status="snapshot.status">
    <AgentThinking v-if="snapshot.reasoning.length" label="推理过程" :default-open="snapshot.status === 'streaming'" :steps="snapshot.reasoning" />

    <view v-if="snapshot.tools.length" class="flex flex-wrap gap-2">
      <AgentToolChip v-for="tool in snapshot.tools" :key="tool.id" :tool="tool" />
    </view>

    <AgentMessage
      v-if="snapshot.message"
      :role="snapshot.message.role"
      stream
      :stream-content="messageContent"
      :stream-error="messageError"
      :stream-final="Boolean(snapshot.message.final)"
      :stream-status="streamStatus"
      @retry="emit('retry')"
    />

    <AgentLoading v-if="streamStatus === 'streaming' && !messageContent" label="正在生成回答" />

    <AgentApproval
      v-if="showApproval"
      :key="approvalId"
      :choices="choices"
      :description="approvalDescription"
      :title="approvalTitle"
      @approve="emit('approve', $event)"
      @reject="emit('reject')"
    />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
