<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
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

withDefaults(
  defineProps<{
    busy?: boolean
    messages?: AgentConversationMessage[]
    snapshot?: AgentStreamSnapshot
    subtitle?: string
    suggestions?: string[]
    title?: string
  }>(),
  {
    busy: false,
    messages: () => [],
    snapshot: undefined,
    subtitle: '工具调用与外部操作始终可见、可确认',
    suggestions: () => [],
    title: 'Varo Agent',
  },
)

const emit = defineEmits<{
  approve: [value: string]
  close: []
  reject: []
  retry: []
  submit: [prompt: string]
}>()
const prompt = defineModel<string>({ default: '' })
</script>

<template>
  <view class="grid min-h-[72vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-[0_20px_60px_rgba(15,23,42,.12)]" aria-label="Agent conversation">
    <view class="flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <text class="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-teal-700 text-sm font-black text-white" aria-hidden="true">
        V
      </text>
      <view class="grid min-w-0 flex-1">
        <text class="truncate text-sm font-bold text-slate-950">
          {{ title }}
        </text>
        <text class="truncate text-[11px] text-slate-400">
          {{ subtitle }}
        </text>
      </view>
      <VButton size="sm" shape="round" tone="default" variant="ghost" class-name="!h-10 !min-h-10 !px-3 !text-xs" aria-label="关闭 Agent" @click="emit('close')">
        关闭
      </VButton>
    </view>

    <scroll-view class="box-border min-h-0 w-full px-4 py-4" scroll-y :scroll-with-animation="true">
      <view class="grid gap-3">
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

    <view class="border-t border-slate-200 bg-white p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <AgentComposer v-model="prompt" :busy="busy" :suggestions="suggestions" @submit="emit('submit', $event)" />
    </view>
  </view>
</template>

<json lang="jsonc">
{
  "component": true,
  "styleIsolation": "apply-shared"
}
</json>
