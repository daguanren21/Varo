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
import { computed } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import AgentComposer from '../agent-ui/AgentComposer.vue'
import AgentComposerScope from '../agent-ui/AgentComposerScope.vue'
import AgentConversation from '../agent-ui/AgentConversation.vue'
import AgentRetrievalProgress from '../agent-ui/AgentRetrievalProgress.vue'
import AgentShell from '../agent-ui/AgentShell.vue'
import AgentSourceReceipt from '../agent-ui/AgentSourceReceipt.vue'
import AgentTaskRunner from '../agent-ui/AgentTaskRunner.vue'
import AgentThreadVersions from '../agent-ui/AgentThreadVersions.vue'

// Keep an omitted native model distinct from a controlled empty string.
defineOptions({
  properties: {
    prompt: { type: null, value: null },
  },
})

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
    promptModifiers?: Record<string, boolean>
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
    promptModifiers: () => ({}),
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
  'toggleSource': [payload: [source: AgentContextSource, enabled: boolean]]
  'update:prompt': [value: string]
}>()

const promptState = useControllableState<string>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.prompt != null),
  defaultValue: '',
  value: computed(() => props.prompt ?? ''),
  onUpdate(value) {
    emit('update:prompt', value)
  },
})
const currentPrompt = computed(() => promptState.current.value)
const actionsDisabled = computed(() => props.disabled || props.busy)
const statusClass = computed(() => props.busy
  ? 'bg-[var(--varo-agent-primary)]'
  : 'bg-[var(--varo-agent-success)]')
const statusLabel = computed(() => props.busy ? 'Agent 正在处理' : 'Agent 已就绪')

function updatePrompt(value: string) {
  if (props.disabled || value === currentPrompt.value) { return }
  promptState.current.value = value
}

function forwardSourceToggle([source, enabled]: [AgentContextSource, boolean]) {
  const current = props.sources.find(item => item.id === source.id)
  if (actionsDisabled.value || !current || (current.status ?? 'available') !== 'available' || current.enabled === enabled) { return }
  emit('toggleSource', [current, enabled])
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
          :disabled="actionsDisabled"
          :sources="sources"
          :usage-percent="contextUsage"
          @connect="connectSource"
          @toggle="forwardSourceToggle"
        />
        <AgentThreadVersions
          class="block w-full min-w-0 max-w-full overflow-hidden"
          :active-id="activeVersionId"
          :disabled="actionsDisabled"
          :versions="versions"
          @branch="emit('branchVersion', $event)"
          @pin="emit('pinVersion', $event)"
          @select="emit('selectVersion', $event)"
        />
        <slot name="execution">
          <AgentConversation class="block w-full min-w-0 max-w-full overflow-hidden" :messages="messages" />
          <AgentRetrievalProgress
            class="block w-full min-w-0 max-w-full overflow-hidden"
            :disabled="actionsDisabled"
            :items="retrieval"
            @retry="retryRetrieval"
          />
          <AgentTaskRunner
            class="block w-full min-w-0 max-w-full overflow-hidden"
            :busy="busy"
            :disabled="disabled"
            :tasks="tasks"
            @approve="emit('approveTask', $event)"
            @cancel="emit('cancelTask')"
            @retry="emit('retryTask', $event)"
          />
          <AgentSourceReceipt
            class="block w-full min-w-0 max-w-full overflow-hidden"
            :disabled="actionsDisabled"
            :items="receipts"
            @connect="receiptIntent('connectReceipt', $event)"
            @open="receiptIntent('openReceipt', $event)"
          />
        </slot>
      </view>

      <view class="box-border w-full min-w-0 max-w-full overflow-hidden border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <AgentComposer
          :model-value="currentPrompt"
          class="block w-full min-w-0 max-w-full overflow-hidden"
          :busy="busy"
          :disabled="disabled"
          @update:modelValue="updatePrompt"
          @submit="submit"
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
