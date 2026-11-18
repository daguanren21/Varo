<script setup lang="ts">
import type { UIMessage } from '@tanstack/ai-client'
import type { AgentConversationEntry, AgentToolCallPreview } from './types'
import { computed } from 'wevu'
import AgentMessageParts from './AgentMessageParts.vue'
import { agentConversationProjection } from './presentation'

const props = withDefaults(
  defineProps<{
    messages?: readonly AgentConversationEntry[]
    contextMessages?: readonly UIMessage[]
    toolCallPreviews?: Readonly<Record<string, AgentToolCallPreview>>
  }>(),
  {
    messages: () => [],
  },
)
const renderedMessages = computed(() => agentConversationProjection(props.messages, props.contextMessages, 'summary').filter(message => message.segments.length))
</script>

<template>
  <view class="agent-conversation box-border grid w-full min-w-0 max-w-full gap-3 overflow-hidden" role="log" aria-live="polite">
    <AgentMessageParts v-for="message in renderedMessages" :key="message.id" :message="message" :tool-call-previews="toolCallPreviews" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
