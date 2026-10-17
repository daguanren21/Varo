<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import type { AgentConversationMessage, AgentTask } from '../agent-ui/types'
import type {
  AgentContextSource,
  AgentRetrievalItem,
  AgentSourceReceiptItem,
  AgentWorkspacePlacement,
} from '../agent-ui/workspace-types'
import { useControllableState } from '@varo-ui/headless'
import { computed } from 'vue'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { AgentComposer, AgentConversation } from '../agent-ui/conversation'
import {
  AgentComposerScope,
  AgentRetrievalProgress,
  AgentShell,
  AgentSourceReceipt,
  AgentTaskRunner,
  AgentThreadVersions,
} from '../agent-ui/workspace'

const props = withDefaults(
  defineProps<{
    activeVersionId?: string
    busy?: boolean
    contextUsage?: number
    disabled?: boolean
    messages?: AgentConversationMessage[]
    open?: boolean
    placement?: AgentWorkspacePlacement
    prompt?: string
    receipts?: AgentSourceReceiptItem[]
    retrieval?: AgentRetrievalItem[]
    sources?: AgentContextSource[]
    subtitle?: string
    tasks?: AgentTask[]
    title?: string
    versions?: readonly AgentThreadVersion[]
  }>(),
  {
    activeVersionId: undefined,
    busy: false,
    contextUsage: 0,
    disabled: false,
    messages: () => [],
    open: true,
    placement: 'page',
    receipts: () => [],
    retrieval: () => [],
    sources: () => [],
    subtitle: '先确认可访问来源，再提交任务',
    tasks: () => [],
    title: 'Agent 工作区',
    versions: () => [],
  },
)

const emit = defineEmits<{
  'approveTask': [task: AgentTask]
  'branchVersion': [version: AgentThreadVersion]
  'cancelTask': []
  'close': []
  'connectReceipt': [receipt: AgentSourceReceiptItem]
  'connectSource': [source: AgentContextSource]
  'openReceipt': [receipt: AgentSourceReceiptItem]
  'pinVersion': [version: AgentThreadVersion]
  'retryRetrieval': [item: AgentRetrievalItem]
  'retryTask': [task: AgentTask]
  'selectVersion': [version: AgentThreadVersion]
  'submit': [prompt: string]
  'toggleSource': [source: AgentContextSource, enabled: boolean]
  'update:prompt': [value: string]
}>()

const promptState = useControllableState<string>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.prompt != null),
  defaultValue: '',
  value: computed(() => props.prompt ?? ''),
  onUpdate: value => emit('update:prompt', value),
})
const currentPrompt = computed(() => promptState.current.value)
const actionsDisabled = computed(() => props.disabled || props.busy)
const statusClass = computed(() => props.busy
  ? 'bg-[var(--varo-agent-primary)]'
  : 'bg-[var(--varo-agent-success)]')
const statusLabel = computed(() => props.busy ? 'Agent 正在处理' : 'Agent 已就绪')

function updatePrompt(value: string) {
  if (props.disabled || props.busy || value === currentPrompt.value) { return }
  promptState.current.value = value
}

function forwardSourceToggle(source: AgentContextSource, enabled: boolean) {
  const current = props.sources.find(item => item.id === source.id)
  if (actionsDisabled.value || !current || (current.status ?? 'available') !== 'available' || current.enabled === enabled) { return }
  emit('toggleSource', current, enabled)
}

function connectSource(source: AgentContextSource) {
  const current = props.sources.find(item => item.id === source.id)
  if (!actionsDisabled.value && current?.status === 'unavailable') { emit('connectSource', current) }
}

function retryRetrieval(item: AgentRetrievalItem) {
  const current = props.retrieval.find(entry => entry.id === item.id)
  if (!actionsDisabled.value && current?.status === 'failed' && current.retryable) { emit('retryRetrieval', current) }
}

function receiptIntent(action: 'connectReceipt' | 'openReceipt', receipt: AgentSourceReceiptItem) {
  if (actionsDisabled.value) { return }
  const current = props.receipts.find(item => item.id === receipt.id)
  if (action === 'openReceipt' && current?.status === 'read') { emit('openReceipt', current) }
  if (action === 'connectReceipt' && current?.status === 'failed') { emit('connectReceipt', current) }
}

function submit(value: string) {
  if (!actionsDisabled.value && value.trim()) { emit('submit', value.trim()) }
}
</script>

<template>
  <AgentShell
    :open="open"
    :placement="placement"
    :title="title"
    @close="emit('close')"
  >
    <section
      class="agent-workspace grid min-h-0 bg-[var(--varo-agent-surface-strong)]"
      :aria-busy="busy"
      :aria-label="title"
    >
      <header class="flex min-h-[52px] items-center gap-3 border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-4 py-2">
        <p class="m-0 min-w-0 flex-1 text-xs leading-5 text-[var(--varo-agent-muted)]">
          {{ subtitle }}
        </p>
        <span class="inline-flex flex-none items-center gap-2 text-[11px] font-semibold text-[var(--varo-agent-muted)]" role="status">
          <i class="h-2 w-2 rounded-full" :class="statusClass" aria-hidden="true" />
          {{ statusLabel }}
        </span>
      </header>

      <div class="grid min-h-0 min-w-0 content-start gap-3 p-3 sm:p-4">
        <AgentComposerScope
          :disabled="actionsDisabled"
          :sources="sources"
          :usage-percent="contextUsage"
          @connect="connectSource"
          @toggle="forwardSourceToggle"
        />
        <AgentThreadVersions
          :active-id="activeVersionId"
          :disabled="actionsDisabled"
          :versions="versions"
          @branch="emit('branchVersion', $event)"
          @pin="emit('pinVersion', $event)"
          @select="emit('selectVersion', $event)"
        />
        <slot name="execution">
          <AgentConversation :messages="messages" />
          <AgentRetrievalProgress
            :disabled="actionsDisabled"
            :items="retrieval"
            @retry="retryRetrieval"
          />
          <AgentTaskRunner
            :busy="busy"
            :disabled="disabled"
            :tasks="tasks"
            @approve="emit('approveTask', $event)"
            @cancel="emit('cancelTask')"
            @retry="emit('retryTask', $event)"
          />
          <AgentSourceReceipt
            :disabled="actionsDisabled"
            :items="receipts"
            @connect="receiptIntent('connectReceipt', $event)"
            @open="receiptIntent('openReceipt', $event)"
          />
        </slot>
      </div>

      <footer class="border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-3">
        <AgentComposer
          :model-value="currentPrompt"
          :busy="busy"
          :disabled="disabled"
          @update:model-value="updatePrompt"
          @submit="submit"
        />
      </footer>
    </section>
  </AgentShell>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-agent.css';
@import '../agent-ui/agent-conversation.css';
@import '../agent-ui/agent-markdown.css';
@import '../agent-ui/agent-workspace.css';
</style>
