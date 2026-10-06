<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../agent-ui/types'
import { computed } from 'vue'
import {
  AgentComposer,
  AgentConversation,

  AgentEventRenderer,
} from '../agent-ui/conversation'
import { VButton } from '../ui/button'

const props = withDefaults(
  defineProps<{
    busy?: boolean
    closeLabel?: string
    messages?: AgentConversationMessage[]
    snapshot?: AgentStreamSnapshot
    subtitle?: string
    suggestions?: string[]
    title?: string
  }>(),
  {
    busy: false,
    closeLabel: '关闭 Agent',
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
const statusLabel = computed(() => props.busy ? '处理中' : '就绪')
</script>

<template>
  <section
    class="box-border grid min-h-[560px] w-full min-w-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-xl border border-[var(--varo-ui-border-lighter)] bg-[var(--varo-ui-surface)] text-sm leading-6 text-[var(--varo-ui-text)]"
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

    <div class="grid min-h-0 min-w-0 content-start gap-6 overflow-y-auto p-4 sm:p-6">
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

    <footer class="min-w-0 px-4 pb-4 sm:px-6 sm:pb-6">
      <AgentComposer v-model="prompt" :busy="busy" :suggestions="suggestions" aria-label="消息内容" placeholder="给 Agent 发送消息…" @submit="emit('submit', $event)" />
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
