<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../agent-ui/types'
import type { AgentAssistantContext, AgentAssistantResponse } from './agent-assistant-sheet.types'
import type { AgentChatHistoryItem } from './agent-chat.types'
import { useControllableState } from '@varo-ui/headless'
import { computed } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import VButton from '../ui/v-button.vue'
import VDrawer from '../ui/v-drawer.vue'
import AgentChat from './agent-chat.vue'

defineOptions({
  properties: {
    open: { type: null, value: null },
    expanded: { type: null, value: null },
    modelValue: { type: null, value: null },
  },
})
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
  history: () => [],
  messages: () => [],
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
const currentOpen = computed(() => openState.current.value)
const currentExpanded = computed(() => expandedState.current.value)
const currentPrompt = computed(() => promptState.current.value)
const modeLabel = computed(() => currentExpanded.value ? '返回助手面板' : '展开助手')
const sheetStyle = computed(() => ({ height: currentExpanded.value ? '88vh' : '70vh' }))
const canInsert = computed(() => !props.disabled && !props.busy && Boolean(props.selectedResponse?.content.trim()))

function updateOpen(value: boolean) {
  if (value === currentOpen.value || (value && props.disabled)) { return }
  openState.current.value = value
  if (!value) { emit('close') }
}

function toggleExpanded() {
  if (!props.disabled || currentExpanded.value) { expandedState.current.value = !currentExpanded.value }
}

function updatePrompt(value: string) {
  promptState.current.value = value
}

function removeContext() {
  if (props.context && !props.disabled) { emit('removeContext', props.context) }
}

function insert() {
  if (canInsert.value && props.selectedResponse) { emit('insert', props.selectedResponse) }
}
</script>

<template>
  <VButton v-if="!currentOpen" class-name="!fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] right-4 z-50" :disabled="disabled" :aria-label="entryLabel" @click="updateOpen(true)">
    {{ entryLabel }}
  </VButton>
  <VDrawer class-name="agent-assistant-sheet" :open="currentOpen" :aria-label="title" placement="bottom" :round="!currentExpanded" @update:open="updateOpen">
    <view class="box-border grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden pt-[env(safe-area-inset-top)]" :style="sheetStyle" :aria-label="title" :data-expanded="currentExpanded">
      <view class="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--varo-ui-border-lighter)] px-4 py-2">
        <VButton variant="ghost" :disabled="disabled && !currentExpanded" @click="toggleExpanded">
          {{ modeLabel }}
        </VButton>
        <VButton :disabled="!canInsert" aria-label="插入到草稿" @click="insert">
          插入到草稿
        </VButton>
      </view>
      <view
        class="min-h-0 min-w-0" style="

--varo-agent-chat-height: 100%"
      >
        <AgentChat :model-value="currentPrompt" fixed layout="page" close-label="关闭助手" :title="title" subtitle="只使用你明确引用的上下文；回答由应用决定是否插入。" :busy="busy" :disabled="disabled" :history="history" :active-history-id="activeHistoryId" :messages="messages" :snapshot="snapshot" :suggestions="suggestions" @update:modelValue="updatePrompt" @close="updateOpen(false)" @submit="emit('submit', $event)" @stop="emit('stop')" @historySelect="emit('historySelect', $event)" @newConversation="emit('newConversation')" @approve="emit('approve', $event)" @reject="emit('reject')" @retry="emit('retry')">
          <template #context>
            <view v-if="context" class="grid min-w-0 gap-2 rounded-lg border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface-muted)] p-3" aria-label="引用上下文">
              <view class="flex items-start justify-between gap-2">
                <text class="min-w-0 break-words font-semibold">
                  {{ context.label }}
                </text>
                <VButton variant="ghost" :disabled="disabled" aria-label="移除引用" @click="removeContext">
                  移除引用
                </VButton>
              </view>
              <text class="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {{ context.text }}
              </text>
            </view>
          </template>
        </AgentChat>
      </view>
    </view>
  </VDrawer>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
