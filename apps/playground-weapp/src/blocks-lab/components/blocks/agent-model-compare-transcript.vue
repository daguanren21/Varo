<script setup lang="ts">
import type { AgentCompareSide, AgentCompareState } from './agent-model-compare.types'
import { computed } from 'wevu'
import AgentConversation from '../../../components/agent-ui/AgentConversation.vue'
import AgentEventRenderer from '../../../components/agent-ui/AgentEventRenderer.vue'
import { provideAgentToolDisclosure } from '../../../components/agent-ui/tool-disclosure'

defineOptions({ options: { virtualHost: true } })
const props = defineProps<{ side: AgentCompareSide, state: AgentCompareState }>()
const emit = defineEmits<{
  approve: [interruptId: string]
  reject: [interruptId: string]
  retry: []
  retryInterrupts: []
  cancelInterrupts: []
}>()
const contextMessages = computed(() => props.state.snapshot?.messages)
provideAgentToolDisclosure(() => contextMessages.value, () => props.state.messages, () => props.state.sessionId, () => props.state.modelId)
</script>

<template>
  <view class="grid min-w-0 gap-3">
    <AgentConversation :messages="state.messages" :context-messages="contextMessages" :tool-call-previews="state.toolCallPreviews" />
    <view :data-compare-output="side">
      <AgentEventRenderer
        v-if="state.snapshot"
        :snapshot="state.snapshot"
        :tool-call-previews="state.toolCallPreviews"
        :retryable="false"
        @approve="emit('approve', $event)"
        @reject="emit('reject', $event)"
        @retry="emit('retry')"
        @retryInterrupts="emit('retryInterrupts')"
        @cancelInterrupts="emit('cancelInterrupts')"
      />
    </view>
  </view>
</template>

<json lang="jsonc">
{ "component": true, "styleIsolation": "apply-shared" }
</json>
