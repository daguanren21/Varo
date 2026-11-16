<script setup lang="ts">
import type { AgentRenderedMessage } from './presentation'
import { computed } from 'wevu'
import AgentMessage from './AgentMessage.vue'
import AgentStream from './AgentStream.vue'
import AgentThinking from './AgentThinking.vue'
import AgentToolChip from './AgentToolChip.vue'
import { agentPartStatusLabels, agentStreamNotice } from './presentation'

const props = withDefaults(defineProps<{
  message: AgentRenderedMessage
  stream?: boolean
  error?: string
  retryable?: boolean
}>(), { retryable: true, stream: false })
const emit = defineEmits<{ retry: [] }>()
const status = computed(() => props.message.status)
const lastTextId = computed(() => {
  let id: string | undefined
  for (const segment of props.message.segments) { if (segment.kind === 'text') { id = segment.id } }
  return id
})
const segments = computed(() => props.message.segments.map(segment => ({
  ...segment,
  compactTool: Boolean(segment.content),
  toolStatus: segment.tool ? agentPartStatusLabels[segment.tool.status] : '',
  stream: props.stream && props.message.role !== 'user',
  markdown: props.message.role !== 'user',
  error: segment.id === lastTextId.value ? props.error : '',
  final: props.message.final || segment.id !== lastTextId.value,
  status: segment.id === lastTextId.value ? status.value : 'completed' as const,
})))
const showNotice = computed(() => !lastTextId.value && Boolean(props.error || agentStreamNotice(status.value)))
const thinkingOpen = computed(() => status.value === 'streaming')
</script>

<template>
  <view class="agent-message-parts grid min-w-0 gap-3">
    <view v-for="segment in segments" :key="segment.id" class="min-w-0" :data-message-part="segment.kind">
      <AgentThinking v-if="segment.kind === 'thinking'" label="推理过程" :default-open="thinkingOpen" :steps="segment.steps" />
      <view v-else-if="segment.kind === 'tool' && segment.tool" class="grid min-w-0 gap-2">
        <AgentToolChip :tool="segment.tool" :compact="segment.compactTool" />
        <text v-if="segment.content" class="text-xs text-[var(--varo-agent-muted)]">{{ segment.toolStatus }}</text>
        <text v-if="segment.content && segment.tool.error" class="whitespace-pre-wrap break-words text-xs text-[var(--varo-agent-danger)]">{{ segment.tool.error }}</text>
        <text v-if="segment.content" class="whitespace-pre-wrap break-words text-xs">{{ segment.content }}</text>
      </view>
      <text v-else-if="segment.kind === 'data'" class="whitespace-pre-wrap break-words text-xs">{{ segment.content }}</text>
      <AgentMessage
        v-else
        :content="segment.content"
        :label="message.label"
        :role="message.role"
        :timestamp="message.timestamp"
        :markdown="segment.markdown"
        :stream="segment.stream"
        :stream-content="segment.content"
        :stream-error="segment.error"
        :stream-final="segment.final"
        :stream-status="segment.status"
        :stream-retryable="retryable"
        @retry="emit('retry')"
      />
    </view>
    <AgentStream v-if="showNotice" :error="error" :final="message.final" :status="status" :retryable="retryable" @retry="emit('retry')" />
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
