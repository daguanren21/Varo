<script setup lang="ts">
import type { UIMessage } from '@tanstack/ai-client'
import type { AgentConversationEntry } from './types'
import { computed } from 'wevu'
import { agentConversationProjection } from './presentation'
import AgentMessageParts from './AgentMessageParts.vue'

const props = withDefaults(
  defineProps<{
    messages?: readonly AgentConversationEntry[]
    contextMessages?: readonly UIMessage[]
  }>(),
  {
    messages: () => [],
  },
)
const renderedMessages = computed(() => agentConversationProjection(props.messages, props.contextMessages).filter(message => message.segments.length))
</script>

<template>
  <view class="agent-conversation box-border grid w-full min-w-0 max-w-full gap-3 overflow-hidden" role="log" aria-live="polite">
    <AgentMessageParts v-for="message in renderedMessages" :key="message.id" :message="message" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
