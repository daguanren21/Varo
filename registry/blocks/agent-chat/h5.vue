<script setup lang="ts">
import type { AgentStreamSnapshot } from '@varo-ui/ai'
import type { AgentConversationMessage } from '../agent-ui'
import { computed } from 'vue'
import {
  AgentComposer,
  AgentConversation,

  AgentEventRenderer,
} from '../agent-ui'
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
const statusClass = computed(() => props.busy
  ? 'agent-ui__pulse bg-[var(--varo-agent-primary)]'
  : 'bg-[var(--varo-agent-success)]')
const statusLabel = computed(() => props.busy ? '处理中' : '就绪')
</script>

<template>
  <section
    class="grid min-h-[560px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-3xl border border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface-strong)] shadow-[var(--varo-agent-shadow)]"
    aria-label="Agent conversation"
    :aria-busy="busy"
  >
    <header class="agent-chat__header flex min-h-16 items-center gap-3 border-b border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] px-4">
      <span class="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-[var(--varo-agent-primary)] text-sm font-black text-white" aria-hidden="true">V</span>
      <span class="agent-chat__meta grid min-w-0 flex-1">
        <strong class="truncate text-sm text-[var(--varo-agent-foreground)]">{{ title }}</strong>
        <small class="truncate text-[12px] text-[var(--varo-agent-muted)]">{{ subtitle }}</small>
      </span>
      <span class="agent-chat__status inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--varo-agent-muted)]" role="status">
        <i class="h-2 w-2 rounded-full" :class="statusClass" aria-hidden="true" />
        {{ statusLabel }}
      </span>
      <VButton size="sm" shape="round" tone="default" variant="ghost" class="!h-10 !min-h-10 !px-3 !text-xs" :aria-label="closeLabel" @click="emit('close')">
        关闭
      </VButton>
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

    <footer class="border-t border-[var(--varo-agent-border)] bg-[var(--varo-agent-surface)] p-3">
      <AgentComposer v-model="prompt" :busy="busy" :suggestions="suggestions" @submit="emit('submit', $event)" />
    </footer>
  </section>
</template>

<style scoped>
@media (max-width: 480px) {
  .agent-chat__header {
    gap: 8px;
    padding-inline: 12px;
  }

  .agent-chat__meta small {
    display: none;
  }

  .agent-chat__status {
    width: 8px;
    overflow: hidden;
    font-size: 0;
  }
}
</style>
