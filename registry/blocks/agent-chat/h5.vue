<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../agent-ui/types'
import type { AgentChatHistoryItem, AgentChatLayout } from './agent-chat.types'
import { useControllableState } from '@varo-ui/headless'
import { computed, onBeforeUnmount, onMounted, onUpdated, useTemplateRef, watch } from 'vue'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import {
  AgentComposer,
  AgentConversation,

  AgentEventRenderer,
} from '../agent-ui/conversation'
import { VButton } from '../ui/button'

const props = withDefaults(
  defineProps<{
    busy?: boolean
    disabled?: boolean
    layout?: AgentChatLayout
    history?: AgentChatHistoryItem[]
    activeHistoryId?: string
    closeLabel?: string
    messages?: AgentConversationMessage[]
    modelValue?: string
    snapshot?: AgentStreamSnapshot
    subtitle?: string
    suggestions?: string[]
    title?: string
  }>(),
  {
    busy: false,
    disabled: false,
    layout: 'panel',
    history: () => [],
    closeLabel: '关闭 Agent',
    messages: () => [],
    snapshot: undefined,
    subtitle: '工具调用与外部操作始终可见、可确认',
    suggestions: () => [],
    title: 'Varo Agent',
  },
)

const emit = defineEmits<{
  'approve': [value: string]
  'close': []
  'historySelect': [id: string]
  'newConversation': []
  'stop': []
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
  onUpdate: value => emit('update:modelValue', value),
})
const prompt = computed(() => promptState.current.value)
const statusLabel = computed(() => props.busy ? '处理中' : '就绪')
const empty = computed(() => props.messages.length === 0 && (!props.snapshot || props.snapshot.status === 'idle'))
const historyChoices = computed(() => props.history.map(item => ({
  ...item,
  active: item.id === props.activeHistoryId,
})))
const shellStyle = computed(() => ({
  height: props.layout === 'page' ? 'var(--varo-agent-chat-height, 100dvh)' : 'min(80dvh, 720px)',
}))
const viewport = useTemplateRef<HTMLElement>('viewport')
const content = useTemplateRef<HTMLElement>('content')
let nearBottom = true
let resizeObserver: ResizeObserver | undefined

function trackScroll() {
  const element = viewport.value
  if (element) { nearBottom = element.scrollHeight - element.clientHeight - element.scrollTop <= 64 }
}

function followContent() {
  const element = viewport.value
  if (element && nearBottom) { element.scrollTop = Math.max(0, element.scrollHeight - element.clientHeight) }
}

watch([() => props.activeHistoryId, empty], () => {
  nearBottom = true
  followContent()
}, { flush: 'post' })
onMounted(() => {
  followContent()
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(followContent)
    if (content.value) { resizeObserver.observe(content.value) }
    if (viewport.value) { resizeObserver.observe(viewport.value) }
  }
})
onUpdated(followContent)
onBeforeUnmount(() => resizeObserver?.disconnect())

function updatePrompt(value: string) {
  if (props.disabled || props.busy || value === prompt.value) { return }
  promptState.current.value = value
}

function selectHistory(id: string) {
  if (!props.disabled && !props.busy && id !== props.activeHistoryId) { emit('historySelect', id) }
}

function newConversation() {
  if (!props.disabled && !props.busy) { emit('newConversation') }
}

function stop() {
  if (props.busy) { emit('stop') }
}
</script>

<template>
  <section
    class="box-border grid w-full min-w-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] text-sm leading-6 text-[var(--varo-ui-text)]"
    :class="layout === 'page' ? 'rounded-none' : 'rounded-xl'"
    :style="shellStyle"
    :data-layout="layout"
    :aria-label="title"
    :aria-busy="busy"
  >
    <header class="flex min-w-0 items-start gap-4 border-b border-[var(--varo-ui-border-lighter)] p-4 sm:px-6">
      <div class="grid min-w-0 flex-1 grid-cols-1 gap-2">
        <h2 class="m-0 break-words text-xl font-semibold leading-7">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="m-0 break-words text-xs leading-5 text-[var(--varo-ui-text-regular)]">
          {{ subtitle }}
        </p>
        <span class="w-fit rounded-md bg-[var(--varo-ui-surface-muted)] px-2 py-1 text-xs leading-5 text-[var(--varo-ui-text-regular)]" role="status">
          {{ statusLabel }}
        </span>
      </div>
      <VButton tone="default" variant="ghost" class="!min-h-11 !flex-none !rounded-lg !px-3 !text-sm !shadow-none" :aria-label="closeLabel" @click="emit('close')">
        关闭
      </VButton>
    </header>

    <div ref="viewport" class="agent-chat__viewport min-h-0 min-w-0 overflow-y-auto [overflow-anchor:none]" @scroll="trackScroll">
      <div ref="content" class="agent-chat__content grid min-w-0 content-start gap-6 p-4 sm:p-6">
        <nav class="flex flex-wrap gap-2" aria-label="会话历史">
          <VButton variant="ghost" :disabled="disabled || busy" @click="newConversation">
            新建会话
          </VButton>
          <VButton v-for="item in historyChoices" :key="item.id" class="max-w-full !whitespace-normal break-words !text-left" variant="ghost" :aria-pressed="item.active" :disabled="disabled || busy" @click="selectHistory(item.id)">
            {{ item.title }}
          </VButton>
        </nav>
        <slot name="context" />
        <div v-if="empty" class="grid gap-2 py-6" data-chat-state="empty">
          <h3 class="m-0 text-lg font-semibold">
            有什么可以帮你？
          </h3>
          <p class="m-0 text-[var(--varo-ui-text-regular)]">
            输入问题，或选择下方建议开始新的对话。
          </p>
        </div>
        <AgentConversation :messages="messages" />
        <AgentEventRenderer
          v-if="snapshot && snapshot.status !== 'idle'"
          :snapshot="snapshot"
          @approve="emit('approve', $event)"
          @reject="emit('reject')"
          @retry="emit('retry')"
        >
          <template v-if="$slots.actions" #actions>
            <slot name="actions" />
          </template>
        </AgentEventRenderer>
        <slot />
      </div>
    </div>

    <footer class="min-w-0 px-4 pb-4 sm:px-6 sm:pb-6">
      <div v-if="busy" class="mb-2 flex justify-end">
        <VButton variant="outline" aria-label="停止生成" @click="stop">
          停止生成
        </VButton>
      </div>
      <AgentComposer :model-value="prompt" :busy="busy" :disabled="disabled" :suggestions="suggestions" aria-label="消息内容" placeholder="给 Agent 发送消息…" @update:model-value="updatePrompt" @submit="emit('submit', $event)" />
    </footer>
  </section>
</template>

<style>
/* Registry styles: generated from the dependency closure. */
@import '../../styles/varo.css';
@import '../../styles/varo-agent.css';
@import '../agent-ui/agent-conversation.css';
@import '../agent-ui/agent-markdown.css';
@import '../../styles/varo-button.css';
</style>
