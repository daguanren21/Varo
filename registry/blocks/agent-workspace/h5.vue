<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import type { AgentConversationMessage, AgentTask } from '../agent-ui'
import type {
  AgentContextSource,
  AgentRetrievalItem,
  AgentSourceReceiptItem,
  AgentWorkspacePlacement,
} from '../agent-ui/advanced-types'
import { computed } from 'vue'
import {
  AgentComposer,
  AgentComposerScope,
  AgentConversation,
  AgentRetrievalProgress,
  AgentShell,
  AgentSourceReceipt,
  AgentTaskRunner,
  AgentThreadVersions,
} from '../agent-ui'

const props = withDefaults(
  defineProps<{
    activeVersionId?: string
    busy?: boolean
    contextUsage?: number
    messages?: AgentConversationMessage[]
    open?: boolean
    placement?: AgentWorkspacePlacement
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
  approveTask: [task: AgentTask]
  branchVersion: [version: AgentThreadVersion]
  cancelTask: []
  close: []
  connectReceipt: [receipt: AgentSourceReceiptItem]
  connectSource: [source: AgentContextSource]
  openReceipt: [receipt: AgentSourceReceiptItem]
  pinVersion: [version: AgentThreadVersion]
  retryRetrieval: [item: AgentRetrievalItem]
  retryTask: [task: AgentTask]
  selectVersion: [version: AgentThreadVersion]
  submit: [prompt: string]
  toggleSource: [source: AgentContextSource, enabled: boolean]
}>()

const prompt = defineModel<string>('prompt', { default: '' })
const statusClass = computed(() => props.busy
  ? 'bg-[var(--varo-agent-primary)]'
  : 'bg-[var(--varo-agent-success)]')
const statusLabel = computed(() => props.busy ? 'Agent 正在处理' : 'Agent 已就绪')

function forwardSourceToggle(source: AgentContextSource, enabled: boolean) {
  emit('toggleSource', source, enabled)
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

      <div class="grid min-h-0 content-start gap-3 p-3 sm:p-4">
        <AgentComposerScope
          :disabled="busy"
          :sources="sources"
          :usage-percent="contextUsage"
          @connect="emit('connectSource', $event)"
          @toggle="forwardSourceToggle"
        />
        <AgentThreadVersions
          :active-id="activeVersionId"
          :versions="versions"
          @branch="emit('branchVersion', $event)"
          @pin="emit('pinVersion', $event)"
          @select="emit('selectVersion', $event)"
        />
        <AgentConversation :messages="messages" />
        <AgentRetrievalProgress
          :items="retrieval"
          @retry="emit('retryRetrieval', $event)"
        />
        <AgentTaskRunner
          :busy="busy"
          :tasks="tasks"
          @approve="emit('approveTask', $event)"
          @cancel="emit('cancelTask')"
          @retry="emit('retryTask', $event)"
        />
        <AgentSourceReceipt
          :items="receipts"
          @connect="emit('connectReceipt', $event)"
          @open="emit('openReceipt', $event)"
        />
      </div>

      <footer class="border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-3">
        <AgentComposer
          v-model="prompt"
          :busy="busy"
          @submit="emit('submit', $event)"
        />
      </footer>
    </section>
  </AgentShell>
</template>
