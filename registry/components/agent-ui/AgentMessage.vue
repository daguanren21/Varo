<script setup lang="ts">
import { computed } from 'wevu'
import AgentMarkdown from './AgentMarkdown.vue'
import AgentStream from './AgentStream.vue'

const props = withDefaults(
  defineProps<{
    content?: string
    label?: string
    markdown?: boolean
    role?: 'assistant' | 'user' | 'system'
    stream?: boolean
    streamContent?: string
    streamError?: string
    streamFinal?: boolean
    streamStatus?: 'completed' | 'failed' | 'idle' | 'streaming'
    timestamp?: string
  }>(),
  {
    content: '',
    label: '',
    markdown: false,
    role: 'assistant',
    stream: false,
    streamContent: '',
    streamError: '',
    streamFinal: false,
    streamStatus: 'idle',
    timestamp: '',
  },
)

const emit = defineEmits<{
  retry: []
}>()

const normalizedContent = computed(() => String(props.content ?? ''))
const normalizedLabel = computed(() => props.label || '')
const normalizedRole = computed(() => props.role || 'assistant')
const normalizedStreamContent = computed(() => props.streamContent || '')
const normalizedStreamError = computed(() => props.streamError || '')
const normalizedStreamStatus = computed(() => props.streamStatus || 'idle')
const normalizedTimestamp = computed(() => props.timestamp || '')
const authorLabel = computed(() => {
  if (normalizedLabel.value) { return normalizedLabel.value }
  if (normalizedRole.value === 'assistant') { return 'Varo Agent' }
  if (normalizedRole.value === 'user') { return '你' }
  return '系统'
})
const columnClass = computed(() =>
  normalizedRole.value === 'user' ? 'max-w-[82%] justify-items-end' : 'flex-1',
)
const bubbleClass = computed(() => {
  if (normalizedRole.value === 'user') {
    return 'rounded-[16px_5px_16px_16px] border-[var(--varo-agent-primary)] bg-[var(--varo-agent-primary)] text-[var(--varo-agent-primary-foreground)]'
  }
  if (normalizedRole.value === 'system') {
    return 'rounded-[5px_16px_16px_16px] border-dashed border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] text-[var(--varo-agent-foreground)]'
  }
  return 'rounded-[5px_16px_16px_16px] border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] text-[var(--varo-agent-foreground)]'
})
</script>

<template>
  <view class="agent-message box-border flex w-full min-w-0 max-w-full items-start gap-2.5 overflow-hidden" :class="[normalizedRole === 'user' && 'justify-end']" :data-role="normalizedRole">
    <view v-if="normalizedRole !== 'user'" class="grid h-[30px] w-[30px] flex-none place-items-center rounded-[10px] bg-[var(--varo-agent-primary)] text-xs font-extrabold text-[var(--varo-agent-primary-foreground)]" aria-hidden="true">
      <text>V</text>
    </view>
    <view class="agent-message__column box-border grid min-w-0 max-w-full gap-1" :class="columnClass">
      <view v-if="normalizedLabel || normalizedTimestamp" class="flex w-full items-center justify-between gap-3.5 px-[3px] text-[11px] text-[var(--varo-agent-muted)]">
        <text>{{ authorLabel }}</text>
        <text v-if="normalizedTimestamp">
          {{ normalizedTimestamp }}
        </text>
      </view>
      <view
        class="box-border w-full min-w-0 max-w-full overflow-hidden break-all border px-[13px] py-[11px] shadow-[0_3px_12px_rgba(15,23,42,.05)]"
        :class="bubbleClass"
      >
        <AgentStream
          v-if="stream"
          class="block w-full min-w-0 max-w-full overflow-hidden"
          :content="normalizedStreamContent"
          :error="normalizedStreamError"
          :final="streamFinal"
          :status="normalizedStreamStatus"
          @retry="emit('retry')"
        />
        <AgentMarkdown v-else-if="markdown" class="block w-full min-w-0 max-w-full overflow-hidden" :content="normalizedContent" final />
        <text v-else class="agent-message__plain-text text-[13px] leading-6">
          {{ normalizedContent }}
        </text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.agent-message__plain-text {
  display: block;
  max-width: 100%;
  word-break: normal;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
