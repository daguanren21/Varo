<script setup lang="ts">
import type { AgentThreadVersion } from '@varo-ui/ai'
import type {
  AgentContextSource,
  AgentRetrievalItem,
  AgentSourceReceiptItem,
  AgentWorkspacePlacement,
} from '../agent-ui/advanced-types'
import type { AgentTask } from '../agent-ui/types'
import { computed } from 'wevu'
import AgentComposer from '../agent-ui/AgentComposer.vue'
import AgentComposerScope from '../agent-ui/AgentComposerScope.vue'
import AgentConversation from '../agent-ui/AgentConversation.vue'
import AgentRetrievalProgress from '../agent-ui/AgentRetrievalProgress.vue'
import AgentShell from '../agent-ui/AgentShell.vue'
import AgentSourceReceipt from '../agent-ui/AgentSourceReceipt.vue'
import AgentTaskRunner from '../agent-ui/AgentTaskRunner.vue'
import AgentThreadVersions from '../agent-ui/AgentThreadVersions.vue'

interface AgentConversationMessage {
  content: string
  id: string
  label?: string
  role: 'assistant' | 'system' | 'user'
  timestamp?: string
}

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
    class="block w-full min-w-0 max-w-full overflow-hidden"
    :open="open"
    :placement="placement"
    :title="title"
    @close="emit('close')"
  >
    <view
      class="agent-workspace box-border grid min-h-0 w-full min-w-0 max-w-full overflow-hidden bg-[var(--varo-agent-surface-strong)]"
      :aria-busy="busy"
      :aria-label="title"
    >
      <view class="flex min-h-[52px] min-w-0 items-center gap-3 overflow-hidden border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-4 py-2">
        <text class="min-w-0 flex-1 text-xs leading-5 text-[var(--varo-agent-muted)]">
          {{ subtitle }}
        </text>
        <view class="inline-flex flex-none items-center gap-2 text-[11px] font-semibold text-[var(--varo-agent-muted)]" role="status">
          <text class="h-2 w-2 rounded-full" :class="statusClass" aria-hidden="true" />
          <text>{{ statusLabel }}</text>
        </view>
      </view>

      <view class="box-border grid min-h-0 w-full min-w-0 max-w-full content-start gap-3 overflow-hidden p-3">
        <AgentComposerScope
          class="block w-full min-w-0 max-w-full overflow-hidden"
          :disabled="busy"
          :sources="sources"
          :usage-percent="contextUsage"
          @connect="emit('connectSource', $event)"
          @toggle="forwardSourceToggle"
        />
        <AgentThreadVersions
          class="block w-full min-w-0 max-w-full overflow-hidden"
          :active-id="activeVersionId"
          :versions="versions"
          @branch="emit('branchVersion', $event)"
          @pin="emit('pinVersion', $event)"
          @select="emit('selectVersion', $event)"
        />
        <AgentConversation class="block w-full min-w-0 max-w-full overflow-hidden" :messages="messages" />
        <AgentRetrievalProgress
          class="block w-full min-w-0 max-w-full overflow-hidden"
          :items="retrieval"
          @retry="emit('retryRetrieval', $event)"
        />
        <AgentTaskRunner
          class="block w-full min-w-0 max-w-full overflow-hidden"
          :busy="busy"
          :tasks="tasks"
          @approve="emit('approveTask', $event)"
          @cancel="emit('cancelTask')"
          @retry="emit('retryTask', $event)"
        />
        <AgentSourceReceipt
          class="block w-full min-w-0 max-w-full overflow-hidden"
          :items="receipts"
          @connect="emit('connectReceipt', $event)"
          @open="emit('openReceipt', $event)"
        />
      </view>

      <view class="box-border w-full min-w-0 max-w-full overflow-hidden border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <AgentComposer
          class="block w-full min-w-0 max-w-full overflow-hidden"
          v-model="prompt"
          :busy="busy"
          @submit="emit('submit', $event)"
        />
      </view>
    </view>
  </AgentShell>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
