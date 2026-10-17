<script setup lang="ts">
import type { AgentCitationItem } from '../agent-ui/advanced-types'
import type { AgentConversationMessage } from '../agent-ui/types'
import type { AgentContextSource, AgentRetrievalItem, AgentSourceReceiptItem } from '../agent-ui/workspace-types'
import type { AgentSourceChatResponseState, AgentSourceChatTicketIntent } from './agent-source-chat.types'
import { useControllableState } from '@varo-ui/headless'
import { computed } from 'vue'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { AgentCitations } from '../agent-ui/advanced'
import { AgentComposerScope, AgentRetrievalProgress, AgentSourceReceipt } from '../agent-ui/workspace'
import { VButton } from '../ui/button'
import AgentChat from './agent-chat.vue'

const props = withDefaults(defineProps<{
  busy?: boolean
  citations?: AgentCitationItem[]
  contextUsage?: number
  disabled?: boolean
  messages?: AgentConversationMessage[]
  modelValue?: string
  receipts?: AgentSourceReceiptItem[]
  responseDetail?: string
  responseState?: AgentSourceChatResponseState
  retrieval?: AgentRetrievalItem[]
  sources?: AgentContextSource[]
  suggestions?: string[]
  ticket?: AgentSourceChatTicketIntent
  title?: string
}>(), {
  busy: false,
  citations: () => [],
  contextUsage: 0,
  disabled: false,
  messages: () => [],
  receipts: () => [],
  responseDetail: '',
  responseState: 'idle',
  retrieval: () => [],
  sources: () => [],
  suggestions: () => [],
  title: '知识来源对话',
})
const emit = defineEmits<{
  'close': []
  'connectReceipt': [receipt: AgentSourceReceiptItem]
  'connectSource': [source: AgentContextSource]
  'createTicket': [intent: AgentSourceChatTicketIntent]
  'newConversation': []
  'openCitation': [citation: AgentCitationItem]
  'openReceipt': [receipt: AgentSourceReceiptItem]
  'retryRetrieval': [item: AgentRetrievalItem]
  'stop': []
  'submit': [prompt: string]
  'toggleSource': [source: AgentContextSource, enabled: boolean]
  'update:modelValue': [value: string]
}>()
const promptState = useControllableState<string>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.modelValue != null),
  defaultValue: '',
  value: computed(() => props.modelValue ?? ''),
  onUpdate: value => emit('update:modelValue', value),
})
const prompt = computed(() => promptState.current.value)
const isBusy = computed(() => props.busy || props.responseState === 'retrieving')
const locked = computed(() => props.disabled || isBusy.value)
const hasScope = computed(() => props.sources.some(source => source.enabled && (source.status ?? 'available') === 'available'))
const chatDisabled = computed(() => props.disabled || !hasScope.value)
const blockedReason = computed(() => props.disabled
  ? '操作已禁用；来源与回执仍可核对。'
  : !hasScope.value
      ? '请先连接并启用至少一个可用来源；当前不能发送问题。'
      : isBusy.value ? '正在检索；暂不能修改范围或提交新问题，可以停止。' : '')
const responseLabels: Record<AgentSourceChatResponseState, string> = {
  'idle': '等待提问',
  'retrieving': '正在检索知识来源',
  'answered': '已提供有来源的回答',
  'empty': '没有找到相关内容',
  'out-of-scope': '问题超出当前知识范围',
  'failed': '检索失败，尚未生成回答',
}
const responseLabel = computed(() => responseLabels[props.responseState])
const responseRole = computed(() => props.responseState === 'failed' ? 'alert' : 'status')
const canCreateTicket = computed(() => !locked.value && Boolean(props.ticket?.question.trim())
  && props.ticket?.reason === props.responseState
  && (props.responseState === 'empty' || props.responseState === 'out-of-scope' || props.responseState === 'failed'))

function updatePrompt(value: string) {
  if (!chatDisabled.value && value !== prompt.value) { promptState.current.value = value }
}
function submit(value: string) {
  const question = value.trim()
  if (!locked.value && hasScope.value && question) { emit('submit', question) }
}
function toggleSource(source: AgentContextSource, enabled: boolean) {
  const current = props.sources.find(item => item.id === source.id)
  if (!locked.value && current && (current.status ?? 'available') === 'available' && current.enabled !== enabled) {
    emit('toggleSource', current, enabled)
  }
}
function connectSource(source: AgentContextSource) {
  const current = props.sources.find(item => item.id === source.id)
  if (!locked.value && current?.status === 'unavailable') { emit('connectSource', current) }
}
function retryRetrieval(item: AgentRetrievalItem) {
  const current = props.retrieval.find(entry => entry.id === item.id)
  if (!locked.value && current?.status === 'failed' && current.retryable) { emit('retryRetrieval', current) }
}
function openReceipt(item: AgentSourceReceiptItem) {
  const current = props.receipts.find(entry => entry.id === item.id)
  if (!locked.value && current?.status === 'read') { emit('openReceipt', current) }
}
function connectReceipt(item: AgentSourceReceiptItem) {
  const current = props.receipts.find(entry => entry.id === item.id)
  if (!locked.value && current?.status === 'failed') { emit('connectReceipt', current) }
}
function openCitation(item: AgentCitationItem) {
  const current = props.citations.find(entry => entry.id === item.id)
  if (!locked.value && current) { emit('openCitation', current) }
}
function createTicket() {
  if (canCreateTicket.value && props.ticket) { emit('createTicket', props.ticket) }
}
function newConversation() {
  if (!locked.value && (prompt.value || props.messages.length || props.responseState !== 'idle' || props.retrieval.length || props.receipts.length || props.citations.length)) {
    emit('newConversation')
  }
}
function stop() {
  if (isBusy.value) { emit('stop') }
}
</script>

<template>
  <section class="grid min-w-0 gap-4 text-[var(--varo-ui-text)]" :aria-label="title" :aria-busy="isBusy">
    <AgentComposerScope :sources="sources" :disabled="locked" :usage-percent="contextUsage" title="知识来源范围" @toggle="toggleSource" @connect="connectSource" />
    <div class="grid gap-2 rounded-xl border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] p-4" :role="responseRole" :data-source-response="responseState">
      <strong>{{ responseLabel }}</strong>
      <p v-if="responseDetail" class="m-0 whitespace-pre-wrap break-words">
        {{ responseDetail }}
      </p>
      <p v-if="blockedReason" class="m-0 text-sm text-[var(--varo-ui-text-regular)]">
        {{ blockedReason }}
      </p>
    </div>
    <AgentRetrievalProgress :items="retrieval" :disabled="locked" @retry="retryRetrieval" />
    <AgentSourceReceipt :items="receipts" :disabled="locked" @open="openReceipt" @connect="connectReceipt" />
    <AgentCitations v-if="citations.length" :items="citations" :disabled="locked" default-open title="回答引用" @open="openCitation" />
    <div class="grid justify-items-start gap-2">
      <VButton variant="outline" :disabled="!canCreateTicket" aria-label="创建工单" @click="createTicket">
        创建工单
      </VButton>
      <p class="m-0 text-xs text-[var(--varo-ui-text-regular)]">
        仅在应用允许转交时可用；点击只请求创建工单，不代表工单已创建。
      </p>
    </div>
    <AgentChat :model-value="prompt" :busy="isBusy" :disabled="chatDisabled" :messages="messages" :suggestions="suggestions" :title="title" subtitle="仅使用上方已启用且可用的知识来源；连接、检索与工单由应用处理。" @update:model-value="updatePrompt" @submit="submit" @stop="stop" @close="emit('close')" @new-conversation="newConversation" />
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-agent.css';
@import '../agent-ui/agent-conversation.css';
@import '../agent-ui/agent-markdown.css';
@import '../../styles/varo-button.css';
@import '../agent-ui/agent-workspace.css';
@import '../agent-ui/agent-advanced.css';
@import '../agent-ui/agent-artifact.css';
</style>
