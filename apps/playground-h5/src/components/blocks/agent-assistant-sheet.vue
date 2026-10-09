<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../agent-ui/types'
import type { AgentAssistantContext, AgentAssistantResponse } from './agent-assistant-sheet.types'
import type { AgentChatHistoryItem } from './agent-chat.types'
import { useControllableState } from '@varo-ui/headless'
import { computed } from 'vue'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import { VButton } from '../ui/button'
import { VDrawer } from '../ui/drawer'
import AgentChat from './agent-chat.vue'

const props = withDefaults(defineProps<{
  activeHistoryId?: string
  busy?: boolean
  context?: AgentAssistantContext
  disabled?: boolean
  entryLabel?: string
  expanded?: boolean
  history?: AgentChatHistoryItem[]
  messages?: AgentConversationMessage[]
  modelValue?: string
  open?: boolean
  selectedResponse?: AgentAssistantResponse
  snapshot?: AgentStreamSnapshot
  suggestions?: string[]
  title?: string
}>(), {
  busy: false,
  disabled: false,
  entryLabel: '打开助手',
  expanded: undefined,
  history: () => [],
  messages: () => [],
  open: undefined,
  suggestions: () => [],
  title: '写作助手',
})
const emit = defineEmits<{
  'approve': [value: string]
  'close': []
  'historySelect': [id: string]
  'insert': [response: AgentAssistantResponse]
  'newConversation': []
  'reject': []
  'removeContext': [context: AgentAssistantContext]
  'retry': []
  'stop': []
  'submit': [prompt: string]
  'update:expanded': [expanded: boolean]
  'update:modelValue': [value: string]
  'update:open': [open: boolean]
}>()
const openState = useControllableState<boolean>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.open != null),
  defaultValue: false,
  value: computed(() => props.open ?? false),
  onUpdate: value => emit('update:open', value),
})
const expandedState = useControllableState<boolean>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.expanded != null),
  defaultValue: false,
  value: computed(() => props.expanded ?? false),
  onUpdate: value => emit('update:expanded', value),
})
const promptState = useControllableState<string>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.modelValue != null),
  defaultValue: '',
  value: computed(() => props.modelValue ?? ''),
  onUpdate: value => emit('update:modelValue', value),
})
const open = computed(() => openState.current.value)
const expanded = computed(() => expandedState.current.value)
const prompt = computed({
  get: () => promptState.current.value,
  set: (value: string) => { promptState.current.value = value },
})
const modeLabel = computed(() => expanded.value ? '返回助手面板' : '展开助手')
const sheetStyle = computed(() => ({ height: expanded.value ? '100dvh' : 'min(80dvh, 640px)' }))
const canInsert = computed(() => !props.disabled && !props.busy && Boolean(props.selectedResponse?.content.trim()))

function updateOpen(value: boolean) {
  if (value === open.value || (value && props.disabled)) { return }
  openState.current.value = value
  if (!value) { emit('close') }
}

function toggleExpanded() {
  if (!props.disabled || expanded.value) { expandedState.current.value = !expanded.value }
}

function removeContext() {
  if (props.context && !props.disabled) { emit('removeContext', props.context) }
}

function insert() {
  if (canInsert.value && props.selectedResponse) { emit('insert', props.selectedResponse) }
}
</script>

<template>
  <!-- Keep the opener mounted beneath the modal so Drawer can restore focus. -->
  <VButton class="!fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] right-4 z-50" :disabled="disabled" :aria-label="entryLabel" @click="updateOpen(true)">
    {{ entryLabel }}
  </VButton>
  <VDrawer class="agent-assistant-sheet" :open="open" :aria-label="title" placement="bottom" :round="!expanded" @update:open="updateOpen">
    <section class="box-border grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden pt-[env(safe-area-inset-top)]" :style="sheetStyle" :aria-label="title" :data-expanded="expanded">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--varo-ui-border-lighter)] px-4 py-2">
        <VButton variant="ghost" :disabled="disabled && !expanded" @click="toggleExpanded">
          {{ modeLabel }}
        </VButton>
        <VButton :disabled="!canInsert" aria-label="插入到草稿" @click="insert">
          插入到草稿
        </VButton>
      </div>
      <AgentChat
        v-model="prompt" class="min-h-0" style="

--varo-agent-chat-height: 100%" layout="page" close-label="关闭助手" :title="title" subtitle="只使用你明确引用的上下文；回答由应用决定是否插入。" :busy="busy" :disabled="disabled" :history="history" :active-history-id="activeHistoryId" :messages="messages" :snapshot="snapshot" :suggestions="suggestions" @close="updateOpen(false)" @submit="emit('submit', $event)" @stop="emit('stop')" @history-select="emit('historySelect', $event)" @new-conversation="emit('newConversation')" @approve="emit('approve', $event)" @reject="emit('reject')" @retry="emit('retry')"
      >
        <template #context>
          <aside v-if="context" class="grid min-w-0 gap-2 rounded-lg border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface-muted)] p-3" aria-label="引用上下文">
            <div class="flex items-start justify-between gap-2">
              <strong class="min-w-0 break-words">{{ context.label }}</strong>
              <VButton variant="ghost" :disabled="disabled" aria-label="移除引用" @click="removeContext">
                移除引用
              </VButton>
            </div>
            <blockquote class="m-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {{ context.text }}
            </blockquote>
          </aside>
        </template>
        <template v-if="$slots.actions" #actions>
          <slot name="actions" />
        </template>
      </AgentChat>
    </section>
  </VDrawer>
</template>

<style>
/* The sheet bounds the drawer; the chat owns conversation scrolling. */
.agent-assistant-sheet .varo-drawer__content[data-placement='bottom'] {
  max-height: 100dvh;
  overflow: hidden;
}

.agent-assistant-sheet footer {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
</style>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-agent.css';
@import '../agent-ui/agent-conversation.css';
@import '../agent-ui/agent-markdown.css';
@import '../../styles/varo-button.css';
@import '../../styles/varo-drawer.css';
</style>
