<script setup lang="ts">
import type { PropType } from 'wevu'
import { computed } from 'wevu'
import AgentMessage from './AgentMessage.vue'

export interface AgentConversationMessage {
  content: string
  id: string
  label?: string
  role: 'assistant' | 'system' | 'user'
  timestamp?: string
}

const props = defineProps({
  messages: { type: null as unknown as PropType<AgentConversationMessage[]>, default: () => [] },
})
const safeMessages = computed(() => (Array.isArray(props.messages) ? props.messages : []).map(message => ({
  content: String(message?.content ?? ''),
  id: String(message?.id ?? ''),
  label: String(message?.label ?? ''),
  role: (message?.role === 'user' || message?.role === 'system' ? message.role : 'assistant') as AgentConversationMessage['role'],
  timestamp: String(message?.timestamp ?? ''),
})))
</script>

<template>
  <view class="agent-conversation grid gap-3" role="log" aria-live="polite">
    <AgentMessage
      v-for="message in safeMessages"
      :key="message.id"
      :content="message.content"
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
