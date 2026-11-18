<script setup lang="ts">
import type { AgentRenderedMessage } from './presentation'
import type { AgentToolCallPreview, AgentToolPart } from './types'
import { computed } from 'wevu'
import AgentMessage from './AgentMessage.vue'
import AgentStream from './AgentStream.vue'
import AgentThinking from './AgentThinking.vue'
import AgentToolCallGroup from './AgentToolCallGroup.vue'
import { agentStreamNotice } from './presentation'

const props = withDefaults(defineProps<{
  message: AgentRenderedMessage
  toolCallPreviews?: Readonly<Record<string, AgentToolCallPreview>>
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
type ToolCall = Pick<AgentToolPart, 'id' | 'name' | 'status'> & { preview?: AgentToolCallPreview }
type RenderedPart
  = | { id: string, groupId: string, kind: 'tool', calls: ToolCall[] }
    | {
      id: string
      kind: 'text' | 'thinking' | 'data'
      content: string
      steps: AgentRenderedMessage['segments'][number]['steps']
      error?: string
      final: boolean
      status: AgentRenderedMessage['status']
    }

const segments = computed(() => {
  const parts: RenderedPart[] = []
  const previews = props.toolCallPreviews
  const lastId = lastTextId.value
  let calls: ToolCall[] | undefined
  for (const { id, kind, content, steps, tool } of props.message.segments) {
    if (kind === 'tool') {
      if (!tool) { continue }
      if (!calls) {
        calls = []
        parts.push({ id: `tool:${tool.id}`, groupId: tool.id, kind, calls })
      }
      // eslint-disable-next-line e18e/prefer-object-has-own -- Native engines need not expose ES2022 built-ins.
      const preview = previews && Object.prototype.hasOwnProperty.call(previews, tool.id) ? previews[tool.id] : undefined
      calls.push({ id: tool.id, name: tool.name, status: tool.status, preview })
      continue
    }
    calls = undefined
    const lastText = id === lastId
    parts.push({
      id: `part:${id}`,
      kind,
      content,
      steps,
      error: lastText ? props.error : '',
      final: props.message.final || !lastText,
      status: lastText ? status.value : 'completed',
    })
  }
  return parts
})
const markdown = computed(() => props.message.role !== 'user')
const stream = computed(() => props.stream && markdown.value)
const showNotice = computed(() => !lastTextId.value && Boolean(props.error || agentStreamNotice(status.value)))
const thinkingOpen = computed(() => status.value === 'streaming')
</script>

<template>
  <view class="agent-message-parts grid min-w-0 gap-3">
    <view v-for="segment in segments" :key="segment.id" class="min-w-0" :data-message-part="segment.kind">
      <AgentThinking v-if="segment.kind === 'thinking'" label="推理过程" :default-open="thinkingOpen" :steps="segment.steps" />
      <AgentToolCallGroup v-else-if="segment.kind === 'tool'" :group-id="segment.groupId" :calls="segment.calls" />
      <text v-else-if="segment.kind === 'data'" class="whitespace-pre-wrap break-words text-xs">
        {{ segment.content }}
      </text>
      <AgentMessage
        v-else
        :content="segment.content"
        :label="message.label"
        :role="message.role"
        :timestamp="message.timestamp"
        :markdown="markdown"
        :stream="stream"
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
