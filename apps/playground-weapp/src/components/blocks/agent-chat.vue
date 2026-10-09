<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../agent-ui/types'
import type { AgentChatHistoryItem, AgentChatLayout } from './agent-chat.types'
import { useControllableState } from '@varo-ui/headless'
import { computed, nextTick, onBeforeUnmount, onMounted, onResize, onUpdated, shallowRef, useNativeInstance, watch } from 'wevu'
import { varoReactiveRuntime } from '../../lib/varo-primitives'
import AgentComposer from '../agent-ui/AgentComposer.vue'
import AgentConversation from '../agent-ui/AgentConversation.vue'
import AgentEventRenderer from '../agent-ui/AgentEventRenderer.vue'
import VButton from '../ui/v-button.vue'

// Keep an omitted native model distinct from a controlled empty string.
defineOptions({
  properties: {
    modelValue: { type: null, value: null },
  },
})

const props = withDefaults(
  defineProps<{
    busy?: boolean
    disabled?: boolean
    fixed?: boolean
    layout?: AgentChatLayout
    history?: AgentChatHistoryItem[]
    activeHistoryId?: string
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
    disabled: false,
    fixed: false,
    layout: 'panel',
    history: () => [],
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
  onUpdate(value) {
    emit('update:modelValue', value)
  },
})
const currentPrompt = computed(() => promptState.current.value)
const statusLabel = computed(() => props.busy ? '处理中' : '就绪')
const empty = computed(() => props.messages.length === 0 && (!props.snapshot || props.snapshot.status === 'idle'))
const historyChoices = computed(() => props.history.map(item => ({
  ...item,
  active: item.id === props.activeHistoryId,
})))
const shellClass = computed(() => props.layout === 'page' ? 'rounded-none' : 'rounded-xl')
const shellStyle = computed(() => ({
  height: props.layout === 'page' ? 'var(--varo-agent-chat-height, 100vh)' : '72vh',
}))
const nativeInstance = useNativeInstance()
const scrollTop = shallowRef(0)
let nearBottom = true
let viewportHeight = 0
let scheduled = false
let measurementPending = false
let disposed = false

interface ChatScrollEvent {
  detail: { scrollTop: number, scrollHeight: number }
}

function trackScroll(event: ChatScrollEvent) {
  nearBottom = event.detail.scrollHeight - viewportHeight - event.detail.scrollTop <= 64
}

function measureContent() {
  if (disposed) { return }
  if (scheduled) {
    measurementPending = true
    return
  }
  scheduled = true
  void nextTick(() => {
    if (disposed) { return }
    const query = nativeInstance.createSelectorQuery()
    if (!query) { throw new Error('AgentChat requires native selector-query geometry') }
    let height = 0
    let currentTop = 0
    let contentHeight = 0
    query.select('.agent-chat__viewport').fields({ size: true, scrollOffset: true }, (rect) => {
      if (rect) {
        height = rect.height
        currentTop = rect.scrollTop
      }
    })
    query.select('.agent-chat__content').boundingClientRect((rect) => {
      if (rect) { contentHeight = rect.height }
    })
    query.exec(() => {
      scheduled = false
      if (disposed) { return }
      if (height > 0) {
        viewportHeight = height
        const bottom = Math.max(0, contentHeight - height)
        if (nearBottom && Math.abs(currentTop - bottom) > 1) { scrollTop.value = bottom }
      }
      if (measurementPending) {
        measurementPending = false
        measureContent()
      }
    })
  })
}

watch([() => props.activeHistoryId, empty], () => { nearBottom = true })
onMounted(measureContent)
onUpdated(measureContent)
onResize(measureContent)
onBeforeUnmount(() => { disposed = true })

function selectHistory(id: string) {
  if (!props.disabled && !props.busy && id !== props.activeHistoryId) { emit('historySelect', id) }
}

function newConversation() {
  if (!props.disabled && !props.busy) { emit('newConversation') }
}

function stop() {
  if (props.busy) { emit('stop') }
}

function updatePrompt(value: string) {
  promptState.current.value = value
}
</script>

<template>
  <view
    class="box-border grid w-full min-w-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] text-sm leading-6 text-[var(--varo-ui-text)]"
    :class="shellClass"
    :style="shellStyle"
    :data-layout="layout"
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

    <scroll-view class="agent-chat__viewport box-border min-h-0 w-full min-w-0" scroll-y :scroll-top="scrollTop" :scroll-with-animation="false" @scroll="trackScroll">
      <view class="agent-chat__content box-border grid min-w-0 gap-6 p-4">
        <view class="flex flex-wrap gap-2" aria-label="会话历史">
          <VButton variant="ghost" :disabled="disabled || busy" @click="newConversation">
            新建会话
          </VButton>
          <VButton v-for="item in historyChoices" :key="item.id" class-name="max-w-full !whitespace-normal break-words !text-left" variant="ghost" :aria-pressed="item.active" :disabled="disabled || busy" @click="selectHistory(item.id)">
            {{ item.title }}
          </VButton>
        </view>
        <slot name="context" />
        <view v-if="empty" class="grid gap-2 py-6" data-chat-state="empty">
          <text class="text-lg font-semibold">
            有什么可以帮你？
          </text>
          <text class="text-[var(--varo-ui-text-regular)]">
            输入问题，或选择下方建议开始新的对话。
          </text>
        </view>
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
      <view v-if="busy" class="mb-2 flex justify-end">
        <VButton variant="outline" aria-label="停止生成" @click="stop">
          停止生成
        </VButton>
      </view>
      <AgentComposer :model-value="currentPrompt" :busy="busy" :disabled="disabled" :fixed="fixed" :suggestions="suggestions" aria-label="消息内容" placeholder="给 Agent 发送消息…" @update:modelValue="updatePrompt" @submit="emit('submit', $event)" />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
