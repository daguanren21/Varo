<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import { useControllableState } from '@varo-ui/headless'
import { computed } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import AgentComposer from '../agent-ui/AgentComposer.vue'
import AgentConversation from '../agent-ui/AgentConversation.vue'
import AgentEventRenderer from '../agent-ui/AgentEventRenderer.vue'
import VButton from '../ui/v-button.vue'

interface AgentConversationMessage {
  content: string
  id: string
  label?: string
  role: 'assistant' | 'system' | 'user'
  timestamp?: string
}

// Keep an omitted native model distinct from a controlled empty string.
defineOptions({
  properties: {
    modelValue: { type: null, value: null },
  },
})

const props = withDefaults(
  defineProps<{
    busy?: boolean
    closeLabel?: string
    messages?: AgentConversationMessage[]
    modelModifiers?: Record<string, boolean>
    modelValue?: string
    snapshot?: AgentStreamSnapshot
    subtitle?: string
    suggestions?: string[]
    title?: string
  }>(),
  {
    busy: false,
    closeLabel: '关闭 Agent',
    messages: () => [],
    modelModifiers: () => ({}),
    snapshot: undefined,
    subtitle: '工具调用与外部操作始终可见、可确认',
    suggestions: () => [],
    title: 'Varo Agent',
  },
)

const emit = defineEmits<{
  'approve': [value: string]
  'close': []
  'reject': []
  'retry': []
  'submit': [prompt: string]
  'update:modelValue': [value: string]
}>()
const promptState = useControllableState<string>({
  runtime: varoReactiveRuntime,
  controlled: computed(() => props.modelValue != null),
  defaultValue: '',
  value: computed(() => props.modelValue ?? ''),
  onUpdate(value) {
    emit('update:modelValue', value)
  },
})
const currentPrompt = computed(() => promptState.current.value)
const statusLabel = computed(() => props.busy ? '处理中' : '就绪')

function updatePrompt(value: string) {
  promptState.current.value = value
}
</script>

<template>
  <view
    class="box-border grid min-h-[72vh] w-full min-w-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-xl border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] text-sm leading-6 text-[var(--varo-ui-text)]"
    :aria-label="title"
    :aria-busy="busy"
  >
    <view class="flex min-w-0 items-start gap-4 border-b border-[var(--varo-ui-border-lighter)] p-4">
      <view class="grid min-w-0 flex-1 grid-cols-1 gap-2">
        <text class="block break-words text-xl font-semibold leading-7">
          {{ title }}
        </text>
        <text v-if="subtitle" class="block break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          {{ subtitle }}
        </text>
        <view class="w-fit rounded-md bg-[var(--varo-ui-surface-muted)] px-2 py-1 text-xs leading-5 text-[var(--varo-ui-text-regular)]" role="status">
          <text>{{ statusLabel }}</text>
        </view>
      </view>
      <VButton tone="default" variant="ghost" class-name="!min-h-11 !rounded-lg !px-3 !text-sm !shadow-none" :aria-label="closeLabel" @click="emit('close')">
        关闭
      </VButton>
    </view>

    <scroll-view class="box-border min-h-0 w-full min-w-0 p-4" scroll-y :scroll-with-animation="false">
      <view class="grid min-w-0 gap-6">
        <AgentConversation :messages="messages" />
        <AgentEventRenderer
          v-if="snapshot && snapshot.status !== 'idle'"
          :snapshot="snapshot"
          @approve="emit('approve', $event)"
          @reject="emit('reject')"
          @retry="emit('retry')"
        />
      </view>
    </scroll-view>

    <view class="box-border w-full min-w-0 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <AgentComposer :model-value="currentPrompt" :busy="busy" :suggestions="suggestions" aria-label="消息内容" placeholder="给 Agent 发送消息…" @update:modelValue="updatePrompt" @submit="emit('submit', $event)" />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
