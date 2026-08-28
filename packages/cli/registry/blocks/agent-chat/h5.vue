<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../agent-ui'
import {
  AgentComposer,
  AgentConversation,

  AgentEventRenderer,
} from '../agent-ui'

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
  <section class="grid min-h-[560px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-[0_20px_60px_rgba(15,23,42,.12)]" aria-label="Agent conversation">
    <header class="flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <span class="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-teal-700 text-sm font-black text-white" aria-hidden="true">V</span>
      <span class="grid min-w-0 flex-1">
        <strong class="truncate text-sm text-slate-950">{{ title }}</strong>
        <small class="truncate text-[11px] text-slate-400">{{ subtitle }}</small>
      </span>
      <button class="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-lg text-slate-500" type="button" aria-label="Close Agent" @click="emit('close')">
        ×
      </button>
    </header>

    <div class="grid min-h-0 content-start gap-3 overflow-y-auto px-4 py-4">
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

    <footer class="border-t border-slate-200 bg-white p-3">
      <AgentComposer v-model="prompt" :busy="busy" :suggestions="suggestions" @submit="emit('submit', $event)" />
    </footer>
  </section>
</template>
