<script setup lang="ts">
import AgentMessage from './AgentMessage.vue'

export interface AgentConversationMessage {
  content: string
  id: string
  label?: string
  role: 'assistant' | 'system' | 'user'
  timestamp?: string
}

withDefaults(
  defineProps<{
    messages?: AgentConversationMessage[]
  }>(),
  {
    messages: () => []
  }
)

function messageContent(message: AgentConversationMessage) {
  return String(message.content ?? '')
}
</script>

<template>
  <view class="agent-conversation grid gap-3" role="log" aria-live="polite">
    <AgentMessage
      v-for="message in messages"
      :key="message.id"
      :content="messageContent(message)"
      :label="message.label"
      :markdown="message.role !== 'user'"
      :role="message.role"
      :timestamp="message.timestamp"
    />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
